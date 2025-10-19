-- ====================================
-- Mentra Photo Album データベースセットアップ
-- ====================================
-- このSQLをSupabase Dashboard > SQL Editorで実行してください
-- 
-- 実行手順：
-- 1. https://supabase.com/dashboard でプロジェクトを開く
-- 2. 左サイドバーから「SQL Editor」をクリック
-- 3. 「New Query」をクリック
-- 4. このファイルの内容をコピー&ペースト
-- 5. 「Run」ボタンをクリック
-- ====================================

-- 必要な拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================
-- 1. プロファイルテーブル
-- ====================================
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（既存のポリシーを削除してから再作成）
DROP POLICY IF EXISTS profiles_select ON public.profiles;
DROP POLICY IF EXISTS profiles_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_update ON public.profiles;
DROP POLICY IF EXISTS profiles_delete ON public.profiles;

-- 自分のプロファイルのみ参照可能
CREATE POLICY profiles_select ON public.profiles
FOR SELECT
USING (user_id = auth.uid());

-- 自分のプロファイルのみ挿入可能
CREATE POLICY profiles_insert ON public.profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 自分のプロファイルのみ更新可能
CREATE POLICY profiles_update ON public.profiles
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 自分のプロファイルのみ削除可能
CREATE POLICY profiles_delete ON public.profiles
FOR DELETE
USING (user_id = auth.uid());

-- ====================================
-- 2. アルバムテーブル
-- ====================================
CREATE TABLE IF NOT EXISTS public.albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  cover_photo_id uuid,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
DROP POLICY IF EXISTS albums_select ON public.albums;
DROP POLICY IF EXISTS albums_insert ON public.albums;
DROP POLICY IF EXISTS albums_update ON public.albums;
DROP POLICY IF EXISTS albums_delete ON public.albums;

-- 自分が所有するアルバムまたは公開アルバムを参照可能
CREATE POLICY albums_select ON public.albums
FOR SELECT
USING (
  owner_id = auth.uid() OR 
  is_public = true OR
  id IN (SELECT album_id FROM public.album_members WHERE user_id = auth.uid())
);

-- 認証済みユーザーはアルバムを作成可能
CREATE POLICY albums_insert ON public.albums
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- 自分が所有するアルバムのみ更新可能
CREATE POLICY albums_update ON public.albums
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- 自分が所有するアルバムのみ削除可能
CREATE POLICY albums_delete ON public.albums
FOR DELETE
USING (owner_id = auth.uid());

-- ====================================
-- 3. アルバムメンバーテーブル
-- ====================================
CREATE TABLE IF NOT EXISTS public.album_members (
  album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','editor','viewer')),
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  PRIMARY KEY (album_id, user_id)
);

-- RLS有効化
ALTER TABLE public.album_members ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
DROP POLICY IF EXISTS album_members_select ON public.album_members;
DROP POLICY IF EXISTS album_members_insert ON public.album_members;
DROP POLICY IF EXISTS album_members_delete ON public.album_members;

-- アルバムのメンバーまたはオーナーが参照可能
CREATE POLICY album_members_select ON public.album_members
FOR SELECT
USING (
  user_id = auth.uid() OR
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

-- アルバムのオーナーがメンバーを追加可能
CREATE POLICY album_members_insert ON public.album_members
FOR INSERT
WITH CHECK (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

-- アルバムのオーナーがメンバーを削除可能
CREATE POLICY album_members_delete ON public.album_members
FOR DELETE
USING (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

-- ====================================
-- 4. 写真テーブル
-- ====================================
CREATE TABLE IF NOT EXISTS public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  storage_key text NOT NULL,
  mime_type text,
  width int,
  height int,
  bytes int,
  exif jsonb,
  caption text,
  created_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
DROP POLICY IF EXISTS photos_select ON public.photos;
DROP POLICY IF EXISTS photos_insert ON public.photos;
DROP POLICY IF EXISTS photos_update ON public.photos;
DROP POLICY IF EXISTS photos_delete ON public.photos;

-- アルバムにアクセス可能なユーザーが写真を参照可能
CREATE POLICY photos_select ON public.photos
FOR SELECT
USING (
  album_id IN (
    SELECT id FROM public.albums 
    WHERE owner_id = auth.uid() 
       OR is_public = true
       OR id IN (SELECT album_id FROM public.album_members WHERE user_id = auth.uid())
  )
);

-- アルバムのメンバーまたはオーナーが写真を追加可能
CREATE POLICY photos_insert ON public.photos
FOR INSERT
WITH CHECK (
  album_id IN (
    SELECT id FROM public.albums 
    WHERE owner_id = auth.uid()
       OR id IN (SELECT album_id FROM public.album_members WHERE user_id = auth.uid() AND role IN ('owner','editor'))
  )
);

-- 自分がアップロードした写真のみ更新可能
CREATE POLICY photos_update ON public.photos
FOR UPDATE
USING (uploader_id = auth.uid())
WITH CHECK (uploader_id = auth.uid());

-- 自分がアップロードした写真またはアルバムのオーナーが削除可能
CREATE POLICY photos_delete ON public.photos
FOR DELETE
USING (
  uploader_id = auth.uid() OR
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

-- ====================================
-- 5. 写真タグテーブル
-- ====================================
CREATE TABLE IF NOT EXISTS public.photo_tags (
  photo_id uuid NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  tag text NOT NULL,
  PRIMARY KEY (photo_id, tag)
);

-- RLS有効化
ALTER TABLE public.photo_tags ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
DROP POLICY IF EXISTS photo_tags_select ON public.photo_tags;

-- 写真にアクセス可能なユーザーがタグを参照可能
CREATE POLICY photo_tags_select ON public.photo_tags
FOR SELECT
USING (
  photo_id IN (
    SELECT id FROM public.photos
    WHERE album_id IN (
      SELECT id FROM public.albums 
      WHERE owner_id = auth.uid() 
         OR is_public = true
         OR id IN (SELECT album_id FROM public.album_members WHERE user_id = auth.uid())
    )
  )
);

-- ====================================
-- 6. コメントテーブル
-- ====================================
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
DROP POLICY IF EXISTS comments_select ON public.comments;
DROP POLICY IF EXISTS comments_insert ON public.comments;
DROP POLICY IF EXISTS comments_delete ON public.comments;

-- 写真にアクセス可能なユーザーがコメントを参照可能
CREATE POLICY comments_select ON public.comments
FOR SELECT
USING (
  photo_id IN (
    SELECT id FROM public.photos
    WHERE album_id IN (
      SELECT id FROM public.albums 
      WHERE owner_id = auth.uid() 
         OR is_public = true
         OR id IN (SELECT album_id FROM public.album_members WHERE user_id = auth.uid())
    )
  )
);

-- 認証済みユーザーがコメント可能
CREATE POLICY comments_insert ON public.comments
FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- 自分のコメントのみ削除可能
CREATE POLICY comments_delete ON public.comments
FOR DELETE
USING (author_id = auth.uid());

-- ====================================
-- 7. 共有リンクテーブル
-- ====================================
CREATE TABLE IF NOT EXISTS public.shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  permission text NOT NULL CHECK (permission IN ('viewer','editor')),
  expires_at timestamptz,
  disabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
DROP POLICY IF EXISTS shares_select ON public.shares;
DROP POLICY IF EXISTS shares_insert ON public.shares;
DROP POLICY IF EXISTS shares_update ON public.shares;
DROP POLICY IF EXISTS shares_delete ON public.shares;

-- アルバムのオーナーが共有リンクを参照可能
CREATE POLICY shares_select ON public.shares
FOR SELECT
USING (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

-- アルバムのオーナーが共有リンクを作成可能
CREATE POLICY shares_insert ON public.shares
FOR INSERT
WITH CHECK (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

-- アルバムのオーナーが共有リンクを更新可能
CREATE POLICY shares_update ON public.shares
FOR UPDATE
USING (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
)
WITH CHECK (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

-- アルバムのオーナーが共有リンクを削除可能
CREATE POLICY shares_delete ON public.shares
FOR DELETE
USING (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

-- ====================================
-- 8. インデックス作成
-- ====================================
CREATE INDEX IF NOT EXISTS idx_photos_album ON public.photos(album_id);
CREATE INDEX IF NOT EXISTS idx_photos_created ON public.photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_album_members_user ON public.album_members(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_token ON public.shares(token);
CREATE INDEX IF NOT EXISTS idx_comments_photo ON public.comments(photo_id);

-- ====================================
-- 9. ストレージバケット作成
-- ====================================
-- 写真用のストレージバケットを作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', false)
ON CONFLICT (id) DO NOTHING;

-- ストレージのRLSポリシー
DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;

-- 認証済みユーザーが写真をアップロード可能
CREATE POLICY "Users can upload photos" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

-- 認証済みユーザーが写真を閲覧可能
CREATE POLICY "Users can view photos" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

-- 認証済みユーザーが自分の写真を更新可能
CREATE POLICY "Users can update own photos" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

-- 認証済みユーザーが自分の写真を削除可能
CREATE POLICY "Users can delete own photos" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

-- ====================================
-- セットアップ完了！
-- ====================================
-- 次のステップ：
-- 1. Authentication > URL Configuration で http://localhost:3000/albums を許可
-- 2. アプリケーションを再起動
-- 3. 新規ユーザーでログインしてプロフィール設定を試す

