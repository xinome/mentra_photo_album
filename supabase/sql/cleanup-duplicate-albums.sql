-- ====================================
-- 重複アルバムの削除スクリプト
-- ====================================
-- このスクリプトは、同名のアルバムが複数ある場合、
-- 古い方を削除します（最新のものだけを残します）
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
-- ステップ2: 重複アルバムの確認
-- ====================================
-- ユーザーIDを確認したら、以下のクエリで 'YOUR_USER_ID_HERE' を置き換えて実行してください
-- 重複しているアルバムを確認します
SELECT 
  a.title,
  COUNT(*) as duplicate_count,
  MIN(a.created_at) as oldest_created_at,
  MAX(a.created_at) as newest_created_at,
  STRING_AGG(a.id::text, ', ' ORDER BY a.created_at) as album_ids
FROM public.albums a
WHERE a.owner_id = 'b4feebf8-6b63-486c-bc6d-5816a69be2ca'::uuid  -- ここにユーザーIDを設定
  AND a.title IN ('家族旅行 2024 沖縄', '田中家結婚式', 'サッカー部春合宿 2024', '大学卒業式')
GROUP BY a.title
HAVING COUNT(*) > 1
ORDER BY a.title;

-- ====================================
-- ステップ3: 削除実行（実際に削除します）
-- ====================================
-- 警告: このクエリを実行すると、古いアルバムが削除されます
-- 各タイトルごとに、最新のアルバム以外を削除します

DO $$
DECLARE
  -- ====================================
  -- 重要: ここに自分のユーザーIDを設定してください
  -- ====================================
  target_user_id uuid := 'b4feebf8-6b63-486c-bc6d-5816a69be2ca'::uuid;  -- ここにユーザーIDを設定
  
  deleted_albums_count integer;
  deleted_photos_count integer;
  album_record RECORD;
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
  
  -- 各サンプルアルバムタイトルについて、重複を削除
  FOR album_record IN 
    SELECT DISTINCT title
    FROM public.albums
    WHERE owner_id = target_user_id
      AND title IN ('家族旅行 2024 沖縄', '田中家結婚式', 'サッカー部春合宿 2024', '大学卒業式')
  LOOP
    RAISE NOTICE '処理中: %', album_record.title;
    
    -- 関連する写真を削除（最新のアルバム以外）
    DELETE FROM public.photos
    WHERE album_id IN (
      SELECT id 
      FROM public.albums
      WHERE owner_id = target_user_id
        AND title = album_record.title
        AND id NOT IN (
          -- 最新のアルバムIDを取得
          SELECT id 
          FROM public.albums
          WHERE owner_id = target_user_id
            AND title = album_record.title
          ORDER BY created_at DESC
          LIMIT 1
        )
    );
    
    GET DIAGNOSTICS deleted_photos_count = ROW_COUNT;
    IF deleted_photos_count > 0 THEN
      RAISE NOTICE '  - 削除した写真数: %', deleted_photos_count;
    END IF;
    
    -- 古いアルバムを削除（最新のもの以外）
    DELETE FROM public.albums
    WHERE owner_id = target_user_id
      AND title = album_record.title
      AND id NOT IN (
        -- 最新のアルバムIDを取得
        SELECT id 
        FROM public.albums
        WHERE owner_id = target_user_id
          AND title = album_record.title
        ORDER BY created_at DESC
        LIMIT 1
      );
    
    GET DIAGNOSTICS deleted_albums_count = ROW_COUNT;
    IF deleted_albums_count > 0 THEN
      RAISE NOTICE '  - 削除したアルバム数: %', deleted_albums_count;
    ELSE
      RAISE NOTICE '  - 重複なし（削除対象なし）';
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ 重複アルバムの削除が完了しました';
END $$;

-- ====================================
-- ステップ4: 削除後の確認
-- ====================================
-- 削除後に、確認します
-- ユーザーIDを確認したら、以下のクエリで 'YOUR_USER_ID_HERE' を置き換えて実行してください
SELECT 
  a.id,
  a.title,
  a.owner_id,
  a.created_at,
  COUNT(p.id) as photo_count
FROM public.albums a
LEFT JOIN public.photos p ON p.album_id = a.id
WHERE a.owner_id = 'b4feebf8-6b63-486c-bc6d-5816a69be2ca'::uuid  -- ここにユーザーIDを設定
  AND a.title IN ('家族旅行 2024 沖縄', '田中家結婚式', 'サッカー部春合宿 2024', '大学卒業式')
GROUP BY a.id, a.title, a.owner_id, a.created_at
ORDER BY a.title, a.created_at DESC;

-- 各タイトルごとに1つだけ存在することを確認してください

