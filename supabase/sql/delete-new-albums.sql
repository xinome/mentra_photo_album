-- ====================================
-- 「新しいアルバム」の削除
-- ====================================
-- タイトルが「新しいアルバム」のアルバムとその写真を削除します

-- 注意: このスクリプトを実行する前に、必ずバックアップを取ってください

-- ====================================
-- ステップ1: 削除対象の確認（実際には削除しません）
-- ====================================
SELECT 
  a.id,
  a.title,
  a.owner_id,
  a.created_at,
  COUNT(p.id) as photo_count
FROM public.albums a
LEFT JOIN public.photos p ON p.album_id = a.id
WHERE a.title = '新しいアルバム'
GROUP BY a.id, a.title, a.owner_id, a.created_at
ORDER BY a.created_at DESC;

-- ====================================
-- ステップ2: 削除実行（実際に削除します）
-- ====================================
-- 警告: このクエリを実行すると、「新しいアルバム」が削除されます

-- CASCADE DELETEにより、アルバムを削除すると関連する写真も自動的に削除されます
DELETE FROM public.albums
WHERE title = '新しいアルバム';

-- ====================================
-- ステップ3: 削除後の確認
-- ====================================
-- 削除後に、確認します
SELECT 
  COUNT(*) as remaining_new_albums
FROM public.albums
WHERE title = '新しいアルバム';

-- 結果が0なら、すべて削除されました

-- ====================================
-- ステップ4: 残っているアルバムの確認
-- ====================================
-- 現在のユーザーのアルバム一覧を確認します
SELECT 
  a.id,
  a.title,
  a.owner_id,
  a.created_at,
  COUNT(p.id) as photo_count
FROM public.albums a
LEFT JOIN public.photos p ON p.album_id = a.id
WHERE a.owner_id = auth.uid()
GROUP BY a.id, a.title, a.owner_id, a.created_at
ORDER BY a.created_at DESC;

