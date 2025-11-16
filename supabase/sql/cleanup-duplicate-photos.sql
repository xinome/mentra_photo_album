-- ====================================
-- 重複写真データのクリーンアップ
-- ====================================
-- 同じアルバムIDとstorage_keyを持つ写真の重複を削除します
-- 各アルバムID + storage_keyの組み合わせで、最も古いcreated_atの1件のみを残します

-- 注意: このスクリプトを実行する前に、必ずバックアップを取ってください

-- ====================================
-- ステップ1: 重複データの確認
-- ====================================
-- 実行前に、どのアルバムにどのくらいの重複があるか確認します
SELECT 
  album_id,
  storage_key,
  COUNT(*) as duplicate_count,
  MIN(created_at) as oldest_created_at,
  MAX(created_at) as newest_created_at
FROM public.photos
GROUP BY album_id, storage_key
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, album_id;

-- ====================================
-- ステップ2: 削除対象の確認（実際には削除しません）
-- ====================================
-- このクエリで、削除される行を確認できます
WITH duplicates AS (
  SELECT 
    id,
    album_id,
    storage_key,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY album_id, storage_key 
      ORDER BY created_at ASC
    ) as row_num
  FROM public.photos
)
SELECT 
  d.*,
  a.title as album_title
FROM duplicates d
JOIN public.albums a ON a.id = d.album_id
WHERE d.row_num > 1
ORDER BY d.album_id, d.storage_key, d.created_at;

-- ====================================
-- ステップ3: 重複データの削除（実際に削除します）
-- ====================================
-- 警告: このクエリを実行すると、重複データが削除されます
-- 実行前に必ずバックアップを取ってください

-- 同じアルバムID + storage_keyの組み合わせで、
-- 最も古いcreated_atの1件のみを残し、それ以外を削除
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY album_id, storage_key 
      ORDER BY created_at ASC
    ) as row_num
  FROM public.photos
)
DELETE FROM public.photos
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- ====================================
-- ステップ4: 削除後の確認
-- ====================================
-- 削除後に、重複がなくなったことを確認します
SELECT 
  album_id,
  storage_key,
  COUNT(*) as count
FROM public.photos
GROUP BY album_id, storage_key
HAVING COUNT(*) > 1;

-- 結果が0行なら、重複はありません

-- ====================================
-- ステップ5: アルバムごとの写真数確認
-- ====================================
-- 各アルバムの写真数を確認します
SELECT 
  a.id as album_id,
  a.title as album_title,
  COUNT(p.id) as photo_count
FROM public.albums a
LEFT JOIN public.photos p ON p.album_id = a.id
WHERE a.owner_id = auth.uid()
GROUP BY a.id, a.title
ORDER BY a.title;

