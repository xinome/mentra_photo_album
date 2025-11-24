-- ====================================
-- サンプルアルバムのコピースクリプト
-- ====================================
-- このスクリプトは、指定したユーザーに対して
-- サンプルアルバム（家族旅行、結婚式、サッカー部春合宿、大学卒業式）を
-- Supabaseにコピーします。
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
-- アプリケーションでログインしているメールアドレスを確認してから実行してください
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- ====================================
-- ステップ2: ユーザーIDを設定して実行
-- ====================================
-- 上記で確認したユーザーIDを以下の変数に設定してください
-- 例: current_user_id := '12345678-1234-1234-1234-123456789012'::uuid;

DO $$
DECLARE
  current_user_id uuid;
  family_album_id uuid;
  wedding_album_id uuid;
  sports_album_id uuid;
  graduation_album_id uuid;
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
  
  -- ====================================
  -- ステップ1: 既存のサンプルアルバムを削除（重複防止）
  -- ====================================
  -- 注意: 既存のサンプルアルバムがある場合は削除されます
  DELETE FROM public.photos
  WHERE album_id IN (
    SELECT id FROM public.albums
    WHERE owner_id = current_user_id
      AND title IN ('家族旅行 2024 沖縄', '田中家結婚式', 'サッカー部春合宿 2024', '大学卒業式')
  );
  
  DELETE FROM public.albums
  WHERE owner_id = current_user_id
    AND title IN ('家族旅行 2024 沖縄', '田中家結婚式', 'サッカー部春合宿 2024', '大学卒業式');
  
  RAISE NOTICE '既存のサンプルアルバムを削除しました（存在する場合）';
  
  -- ====================================
  -- ステップ2: サンプルアルバムを作成
  -- ====================================
  
  -- 家族旅行アルバム
  INSERT INTO public.albums (id, owner_id, title, description, is_public, created_at)
  VALUES (
    gen_random_uuid(),
    current_user_id,
    '家族旅行 2024 沖縄',
    '2024年夏の沖縄旅行の思い出。美しいビーチと美味しい料理を楽しみました。',
    false,
    now() - interval '5 days'
  )
  RETURNING id INTO family_album_id;
  
  -- 結婚式アルバム
  INSERT INTO public.albums (id, owner_id, title, description, is_public, created_at)
  VALUES (
    gen_random_uuid(),
    current_user_id,
    '田中家結婚式',
    '2024年春の素敵な結婚式。新郎新婦の幸せな笑顔が印象的でした。',
    true,
    now() - interval '15 days'
  )
  RETURNING id INTO wedding_album_id;
  
  -- サッカー部春合宿アルバム
  INSERT INTO public.albums (id, owner_id, title, description, is_public, created_at)
  VALUES (
    gen_random_uuid(),
    current_user_id,
    'サッカー部春合宿 2024',
    '春合宿の楽しい思い出。チームワークが深まった3日間。',
    false,
    now() - interval '30 days'
  )
  RETURNING id INTO sports_album_id;
  
  -- 大学卒業式アルバム
  INSERT INTO public.albums (id, owner_id, title, description, is_public, created_at)
  VALUES (
    gen_random_uuid(),
    current_user_id,
    '大学卒業式',
    '4年間の思い出が詰まった卒業式。仲間との別れと新しい門出。',
    false,
    now() - interval '60 days'
  )
  RETURNING id INTO graduation_album_id;
  
  RAISE NOTICE '✅ サンプルアルバムを4つ作成しました！';
  
  -- ====================================
  -- ステップ3: 各アルバムに写真を追加
  -- ====================================
  -- 注意: Unsplashの画像URLをサンプルデータとして使用します
  
  -- 家族旅行アルバムの写真
  INSERT INTO public.photos (album_id, uploader_id, storage_key, caption, created_at)
  VALUES 
    (family_album_id, current_user_id, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80', '美しい沖縄の海！最高の景色でした。', now() - interval '5 days'),
    (family_album_id, current_user_id, 'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=1200&q=80', 'ビーチでリラックス', now() - interval '5 days'),
    (family_album_id, current_user_id, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', '夕暮れの海辺', now() - interval '5 days'),
    (family_album_id, current_user_id, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80', 'サンセットビーチ', now() - interval '4 days'),
    (family_album_id, current_user_id, 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200&q=80', '青い空と白い雲', now() - interval '4 days'),
    (family_album_id, current_user_id, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80', '家族みんなで海水浴', now() - interval '4 days');
  
  -- 結婚式アルバムの写真
  INSERT INTO public.photos (album_id, uploader_id, storage_key, caption, created_at)
  VALUES 
    (wedding_album_id, current_user_id, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80', '結婚式の会場', now() - interval '15 days'),
    (wedding_album_id, current_user_id, 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80', '新郎新婦の入場', now() - interval '15 days'),
    (wedding_album_id, current_user_id, 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80', 'ケーキカット', now() - interval '15 days'),
    (wedding_album_id, current_user_id, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80', '乾杯の瞬間', now() - interval '14 days'),
    (wedding_album_id, current_user_id, 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80', 'スピーチの時間', now() - interval '14 days'),
    (wedding_album_id, current_user_id, 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80', 'ダンスフロア', now() - interval '14 days'),
    (wedding_album_id, current_user_id, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80', 'ブーケトス', now() - interval '14 days'),
    (wedding_album_id, current_user_id, 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80', '最後の集合写真', now() - interval '14 days');
  
  -- サッカー部春合宿アルバムの写真
  INSERT INTO public.photos (album_id, uploader_id, storage_key, caption, created_at)
  VALUES 
    (sports_album_id, current_user_id, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', '合宿所に到着', now() - interval '30 days'),
    (sports_album_id, current_user_id, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', '朝の練習', now() - interval '30 days'),
    (sports_album_id, current_user_id, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', 'チームミーティング', now() - interval '29 days'),
    (sports_album_id, current_user_id, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', '試合の様子', now() - interval '29 days'),
    (sports_album_id, current_user_id, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', '夕食の時間', now() - interval '29 days'),
    (sports_album_id, current_user_id, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', '夜のミーティング', now() - interval '28 days'),
    (sports_album_id, current_user_id, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', '最終日の集合写真', now() - interval '28 days');
  
  -- 大学卒業式アルバムの写真
  INSERT INTO public.photos (album_id, uploader_id, storage_key, caption, created_at)
  VALUES 
    (graduation_album_id, current_user_id, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', '卒業式会場', now() - interval '60 days'),
    (graduation_album_id, current_user_id, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', '式の開始', now() - interval '60 days'),
    (graduation_album_id, current_user_id, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', '卒業証書授与', now() - interval '60 days'),
    (graduation_album_id, current_user_id, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', '記念撮影', now() - interval '60 days'),
    (graduation_album_id, current_user_id, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', '友人との集合写真', now() - interval '60 days'),
    (graduation_album_id, current_user_id, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', '家族との記念写真', now() - interval '60 days'),
    (graduation_album_id, current_user_id, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', '最後の集合写真', now() - interval '60 days');
  
  RAISE NOTICE '✅ サンプル写真を追加しました！';
  RAISE NOTICE '完了: サンプルアルバムのコピーが完了しました。';
  
END $$;

