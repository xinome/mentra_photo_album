-- ====================================
-- updated_at カラムの修正
-- ====================================
-- 500エラーの原因となる NULL の updated_at を修正します

-- 既存のアルバムの updated_at を修正
UPDATE public.albums
SET updated_at = COALESCE(updated_at, created_at, now())
WHERE updated_at IS NULL;

-- 確認クエリ
SELECT 
  id,
  title,
  created_at,
  updated_at,
  CASE 
    WHEN updated_at IS NULL THEN '❌ NULL'
    ELSE '✅ 正常'
  END as status
FROM public.albums
ORDER BY created_at DESC;

-- 統計
SELECT 
  COUNT(*) as total_albums,
  COUNT(updated_at) as albums_with_updated_at,
  COUNT(*) - COUNT(updated_at) as albums_without_updated_at
FROM public.albums;

