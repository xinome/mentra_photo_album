-- ====================================
-- ステップ2: RLSポリシー設定
-- ====================================
-- 前提: 01-tables-only.sql が実行済み
-- ====================================

-- ====================================
-- 1. profiles テーブルのRLS
-- ====================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select ON public.profiles;
DROP POLICY IF EXISTS profiles_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_update ON public.profiles;
DROP POLICY IF EXISTS profiles_delete ON public.profiles;

CREATE POLICY profiles_select ON public.profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY profiles_insert ON public.profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY profiles_update ON public.profiles
FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY profiles_delete ON public.profiles
FOR DELETE USING (user_id = auth.uid());

-- ====================================
-- 2. albums テーブルのRLS
-- ====================================
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS albums_select ON public.albums;
DROP POLICY IF EXISTS albums_insert ON public.albums;
DROP POLICY IF EXISTS albums_update ON public.albums;
DROP POLICY IF EXISTS albums_delete ON public.albums;

CREATE POLICY albums_select ON public.albums
FOR SELECT USING (
  owner_id = auth.uid() OR 
  is_public = true OR
  id IN (SELECT album_id FROM public.album_members WHERE user_id = auth.uid())
);

CREATE POLICY albums_insert ON public.albums
FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY albums_update ON public.albums
FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY albums_delete ON public.albums
FOR DELETE USING (owner_id = auth.uid());

-- ====================================
-- 3. album_members テーブルのRLS
-- ====================================
ALTER TABLE public.album_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS album_members_select ON public.album_members;
DROP POLICY IF EXISTS album_members_insert ON public.album_members;
DROP POLICY IF EXISTS album_members_delete ON public.album_members;

CREATE POLICY album_members_select ON public.album_members
FOR SELECT USING (
  user_id = auth.uid() OR
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

CREATE POLICY album_members_insert ON public.album_members
FOR INSERT WITH CHECK (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

CREATE POLICY album_members_delete ON public.album_members
FOR DELETE USING (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

-- ====================================
-- 4. photos テーブルのRLS
-- ====================================
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS photos_select ON public.photos;
DROP POLICY IF EXISTS photos_insert ON public.photos;
DROP POLICY IF EXISTS photos_update ON public.photos;
DROP POLICY IF EXISTS photos_delete ON public.photos;

CREATE POLICY photos_select ON public.photos
FOR SELECT USING (
  album_id IN (
    SELECT id FROM public.albums 
    WHERE owner_id = auth.uid() 
       OR is_public = true
       OR id IN (SELECT album_id FROM public.album_members WHERE user_id = auth.uid())
  )
);

CREATE POLICY photos_insert ON public.photos
FOR INSERT WITH CHECK (
  album_id IN (
    SELECT id FROM public.albums 
    WHERE owner_id = auth.uid()
       OR id IN (SELECT album_id FROM public.album_members WHERE user_id = auth.uid() AND role IN ('owner','editor'))
  )
);

CREATE POLICY photos_update ON public.photos
FOR UPDATE USING (uploader_id = auth.uid()) WITH CHECK (uploader_id = auth.uid());

CREATE POLICY photos_delete ON public.photos
FOR DELETE USING (
  uploader_id = auth.uid() OR
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

-- ====================================
-- 5. photo_tags テーブルのRLS
-- ====================================
ALTER TABLE public.photo_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS photo_tags_select ON public.photo_tags;

CREATE POLICY photo_tags_select ON public.photo_tags
FOR SELECT USING (
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
-- 6. comments テーブルのRLS
-- ====================================
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS comments_select ON public.comments;
DROP POLICY IF EXISTS comments_insert ON public.comments;
DROP POLICY IF EXISTS comments_delete ON public.comments;

CREATE POLICY comments_select ON public.comments
FOR SELECT USING (
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

CREATE POLICY comments_insert ON public.comments
FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY comments_delete ON public.comments
FOR DELETE USING (author_id = auth.uid());

-- ====================================
-- 7. shares テーブルのRLS
-- ====================================
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS shares_select ON public.shares;
DROP POLICY IF EXISTS shares_insert ON public.shares;
DROP POLICY IF EXISTS shares_update ON public.shares;
DROP POLICY IF EXISTS shares_delete ON public.shares;

CREATE POLICY shares_select ON public.shares
FOR SELECT USING (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

CREATE POLICY shares_insert ON public.shares
FOR INSERT WITH CHECK (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

CREATE POLICY shares_update ON public.shares
FOR UPDATE USING (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
) WITH CHECK (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

CREATE POLICY shares_delete ON public.shares
FOR DELETE USING (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

-- ====================================
-- 完了
-- ====================================
-- RLSポリシーの設定が完了しました
-- 次は 03-storage.sql を実行してください（オプション）

