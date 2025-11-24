-- ====================================
-- 「新しいアルバム」の削除（修正版）
-- ====================================
-- このスクリプトは、ユーザーIDを直接指定して
-- 「新しいアルバム」を削除します
--
-- 実行方法：
-- 1. ステップ1でユーザーIDを確認
-- 2. ステップ2でユーザーIDを設定して実行
-- ====================================

-- ====================================
-- ステップ1: ユーザーIDの確認
-- ====================================
-- 以下のクエリを実行して、自分のユーザーIDを確認してください
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- ====================================
-- ステップ2: 削除対象の確認
-- ====================================
-- ユーザーIDを確認したら、以下のクエリで 'YOUR_USER_ID_HERE' を置き換えて実行してください
SELECT 
  a.id,
  a.title,
  a.owner_id,
  a.created_at,
  u.email as owner_email,
  COUNT(p.id) as photo_count
FROM public.albums a
LEFT JOIN auth.users u ON a.owner_id = u.id
LEFT JOIN public.photos p ON p.album_id = a.id
WHERE a.title = '新しいアルバム'
  AND a.owner_id = 'b4feebf8-6b63-486c-bc6d-5816a69be2ca'::uuid  -- ここにユーザーIDを設定
GROUP BY a.id, a.title, a.owner_id, a.created_at, u.email
ORDER BY a.created_at DESC;

-- ====================================
-- ステップ3: 削除実行（実際に削除します）
-- ====================================
-- 警告: このクエリを実行すると、「新しいアルバム」が削除されます

DO $$
DECLARE
  -- ====================================
  -- 重要: ここに自分のユーザーIDを設定してください
  -- ====================================
  target_user_id uuid := 'b4feebf8-6b63-486c-bc6d-5816a69be2ca'::uuid;  -- ここにユーザーIDを設定
  
  deleted_photos_count integer;
  deleted_albums_count integer;
BEGIN
  -- ユーザーIDの検証（NULLチェック）
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'ユーザーIDが設定されていません。target_user_id変数に実際のユーザーIDを設定してください。';
  END IF;
  
  -- ユーザーが存在するか確認
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'ユーザーID % が見つかりません。正しいユーザーIDを設定してください。', target_user_id;
  END IF;
  
  RAISE NOTICE '対象ユーザーID: %', target_user_id;
  
  -- 削除対象の確認
  SELECT COUNT(*) INTO deleted_albums_count
  FROM public.albums
  WHERE owner_id = target_user_id
    AND title = '新しいアルバム';
  
  IF deleted_albums_count = 0 THEN
    RAISE NOTICE 'ℹ️ 削除対象の「新しいアルバム」は見つかりませんでした';
    RETURN;
  END IF;
  
  RAISE NOTICE '削除対象の「新しいアルバム」: % 件', deleted_albums_count;
  
  -- 関連する写真を削除
  DELETE FROM public.photos
  WHERE album_id IN (
    SELECT id FROM public.albums
    WHERE owner_id = target_user_id
      AND title = '新しいアルバム'
  );
  
  GET DIAGNOSTICS deleted_photos_count = ROW_COUNT;
  RAISE NOTICE '削除した写真数: %', deleted_photos_count;
  
  -- アルバムを削除
  DELETE FROM public.albums
  WHERE owner_id = target_user_id
    AND title = '新しいアルバム';
  
  GET DIAGNOSTICS deleted_albums_count = ROW_COUNT;
  
  IF deleted_albums_count > 0 THEN
    RAISE NOTICE '✅ 「新しいアルバム」を % 件削除しました', deleted_albums_count;
  ELSE
    RAISE NOTICE 'ℹ️ 削除対象の「新しいアルバム」は見つかりませんでした';
  END IF;
END $$;

-- ====================================
-- ステップ4: 削除後の確認
-- ====================================
-- 削除後に、確認します
-- ユーザーIDを確認したら、以下のクエリで 'b4feebf8-6b63-486c-bc6d-5816a69be2ca' を必要に応じて置き換えて実行してください
SELECT 
  COUNT(*) as remaining_new_albums
FROM public.albums
WHERE title = '新しいアルバム'
  AND owner_id = 'b4feebf8-6b63-486c-bc6d-5816a69be2ca'::uuid;  -- ここにユーザーIDを設定

-- 結果が0なら、すべて削除されました

