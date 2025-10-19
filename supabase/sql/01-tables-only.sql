-- ====================================
-- ステップ1: テーブルのみ作成（RLSなし）
-- ====================================
-- このスクリプトはテーブル構造のみを作成します
-- RLSポリシーは後から追加します
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

-- ====================================
-- 5. 写真タグテーブル
-- ====================================
CREATE TABLE IF NOT EXISTS public.photo_tags (
  photo_id uuid NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  tag text NOT NULL,
  PRIMARY KEY (photo_id, tag)
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

-- ====================================
-- 8. インデックス作成
-- ====================================
CREATE INDEX IF NOT EXISTS idx_photos_album ON public.photos(album_id);
CREATE INDEX IF NOT EXISTS idx_photos_created ON public.photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_album_members_user ON public.album_members(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_token ON public.shares(token);
CREATE INDEX IF NOT EXISTS idx_comments_photo ON public.comments(photo_id);

-- ====================================
-- 完了
-- ====================================
-- テーブルの作成が完了しました
-- 次は 02-rls-policies.sql を実行してください

