-- ====================================
-- 「新しいアルバム」の削除
-- ====================================
-- タイトルが「新しいアルバム」のアルバムとその写真を削除します
--
-- 実行方法：
-- 1. まず、自分のユーザーIDを確認してください（下記の「ステップ1」を実行）
-- 2. 確認したユーザーIDを「ステップ2」の変数に設定してください
-- 3. 「ステップ2」以降を実行してください
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
-- ステップ2: 削除対象の確認（実際には削除しません）
-- ====================================
-- このクエリを実行して、削除対象を確認してください
-- ユーザーIDを確認したら、以下のクエリで 'YOUR_USER_ID_HERE' を置き換えて実行してください
SELECT 
  a.id,
  a.title,
  a.owner_id,
  a.created_at,
  COUNT(p.id) as photo_count
FROM public.albums a
LEFT JOIN public.photos p ON p.album_id = a.id
WHERE a.title = '新しいアルバム'
  AND a.owner_id = 'YOUR_USER_ID_HERE'::uuid  -- ここにユーザーIDを設定
GROUP BY a.id, a.title, a.owner_id, a.created_at
ORDER BY a.created_at DESC;

-- ====================================
-- ステップ3: 削除実行（実際に削除します）
-- ====================================
-- 警告: このクエリを実行すると、「新しいアルバム」が削除されます

DO $$
DECLARE
  current_user_id uuid;
  deleted_count integer;
BEGIN
  -- ====================================
  -- 重要: ここに自分のユーザーIDを設定してください
  -- ====================================
  -- ステップ1で確認したユーザーIDをコピー&ペーストしてください
  -- 例: current_user_id := '12345678-1234-1234-1234-123456789012'::uuid;
  
  -- ユーザーIDを設定（以下の行のコメントを外して、ユーザーIDを設定してください）
  -- current_user_id := 'YOUR_USER_ID_HERE'::uuid;
  
  -- または、最新のユーザーIDを自動取得（複数ユーザーがいる場合は注意）
  SELECT id INTO current_user_id 
  FROM auth.users 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'ユーザーIDが見つかりません。ステップ1でユーザーIDを確認して、current_user_id変数に設定してください。';
  END IF;
  
  RAISE NOTICE '使用するユーザーID: %', current_user_id;
  
  -- 関連する写真を削除
  DELETE FROM public.photos
  WHERE album_id IN (
    SELECT id FROM public.albums
    WHERE owner_id = current_user_id
      AND title = '新しいアルバム'
  );
  
  -- アルバムを削除
  DELETE FROM public.albums
  WHERE owner_id = current_user_id
    AND title = '新しいアルバム';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  IF deleted_count > 0 THEN
    RAISE NOTICE '✅ 「新しいアルバム」を % 件削除しました', deleted_count;
  ELSE
    RAISE NOTICE 'ℹ️ 削除対象の「新しいアルバム」は見つかりませんでした';
  END IF;
END $$;

-- ====================================
-- ステップ4: 削除後の確認
-- ====================================
-- 削除後に、確認します
-- ユーザーIDを確認したら、以下のクエリで 'YOUR_USER_ID_HERE' を置き換えて実行してください
SELECT 
  COUNT(*) as remaining_new_albums
FROM public.albums
WHERE title = '新しいアルバム'
  AND owner_id = 'YOUR_USER_ID_HERE'::uuid;  -- ここにユーザーIDを設定

-- 結果が0なら、すべて削除されました

-- ====================================
-- ステップ5: 残っているアルバムの確認
-- ====================================
-- 現在のユーザーのアルバム一覧を確認します
-- ユーザーIDを確認したら、以下のクエリで 'YOUR_USER_ID_HERE' を置き換えて実行してください
SELECT 
  a.id,
  a.title,
  a.owner_id,
  a.created_at,
  COUNT(p.id) as photo_count
FROM public.albums a
LEFT JOIN public.photos p ON p.album_id = a.id
WHERE a.owner_id = 'YOUR_USER_ID_HERE'::uuid  -- ここにユーザーIDを設定
GROUP BY a.id, a.title, a.owner_id, a.created_at
ORDER BY a.created_at DESC;

