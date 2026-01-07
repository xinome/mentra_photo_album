-- 写真のメタデータカラムを追加
-- タイトル、撮影日、説明を保存するためのカラム

ALTER TABLE public.photos
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS taken_at timestamptz,
ADD COLUMN IF NOT EXISTS description text;

-- 既存のcaptionをtitleに移行（captionが存在する場合）
UPDATE public.photos
SET title = caption
WHERE title IS NULL AND caption IS NOT NULL;

