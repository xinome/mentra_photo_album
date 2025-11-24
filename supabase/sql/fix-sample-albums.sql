-- ====================================
-- サンプルアルバムの修正スクリプト
-- ====================================
-- このスクリプトは、ユーザーIDを直接指定して
-- サンプルアルバムを作成または修正します
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
-- ステップ2: ユーザーIDを設定して実行
-- ====================================
-- 上記で確認したユーザーIDを以下の変数に設定してください
-- 例: '12345678-1234-1234-1234-123456789012'::uuid

DO $$
DECLARE
  -- ====================================
  -- 重要: ここに自分のユーザーIDを設定してください
  -- ====================================
  target_user_id uuid := 'b4feebf8-6b63-486c-bc6d-5816a69be2ca'::uuid;  -- ここにユーザーIDを設定
  
  family_album_id uuid;
  wedding_album_id uuid;
  sports_album_id uuid;
  graduation_album_id uuid;
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
  
  -- ====================================
  -- ステップ1: 既存のサンプルアルバムを削除（重複防止）
  -- ====================================
  RAISE NOTICE '既存のサンプルアルバムを削除中...';
  
  -- 関連する写真を削除
  DELETE FROM public.photos
  WHERE album_id IN (
    SELECT id FROM public.albums
    WHERE owner_id = target_user_id
      AND title IN ('家族旅行 2024 沖縄', '田中家結婚式', 'サッカー部春合宿 2024', '大学卒業式')
  );
  
  GET DIAGNOSTICS deleted_photos_count = ROW_COUNT;
  RAISE NOTICE '削除した写真数: %', deleted_photos_count;
  
  -- アルバムを削除
  DELETE FROM public.albums
  WHERE owner_id = target_user_id
    AND title IN ('家族旅行 2024 沖縄', '田中家結婚式', 'サッカー部春合宿 2024', '大学卒業式');
  
  GET DIAGNOSTICS deleted_albums_count = ROW_COUNT;
  RAISE NOTICE '削除したアルバム数: %', deleted_albums_count;
  
  -- ====================================
  -- ステップ2: サンプルアルバムを作成
  -- ====================================
  RAISE NOTICE 'サンプルアルバムを作成中...';
  
  -- 家族旅行アルバム
  INSERT INTO public.albums (id, owner_id, title, description, is_public, created_at)
  VALUES (
    gen_random_uuid(),
    target_user_id,
    '家族旅行 2024 沖縄',
    '2024年夏の沖縄旅行の思い出。美しいビーチと美味しい料理を楽しみました。',
    false,
    now() - interval '5 days'
  )
  RETURNING id INTO family_album_id;
  
  RAISE NOTICE '家族旅行アルバムを作成: %', family_album_id;
  
  -- 結婚式アルバム
  INSERT INTO public.albums (id, owner_id, title, description, is_public, created_at)
  VALUES (
    gen_random_uuid(),
    target_user_id,
    '田中家結婚式',
    '2024年春の素敵な結婚式。新郎新婦の幸せな笑顔が印象的でした。',
    true,
    now() - interval '15 days'
  )
  RETURNING id INTO wedding_album_id;
  
  RAISE NOTICE '結婚式アルバムを作成: %', wedding_album_id;
  
  -- サッカー部春合宿アルバム
  INSERT INTO public.albums (id, owner_id, title, description, is_public, created_at)
  VALUES (
    gen_random_uuid(),
    target_user_id,
    'サッカー部春合宿 2024',
    '春合宿の楽しい思い出。チームワークが深まった3日間。',
    false,
    now() - interval '30 days'
  )
  RETURNING id INTO sports_album_id;
  
  RAISE NOTICE 'サッカー部春合宿アルバムを作成: %', sports_album_id;
  
  -- 大学卒業式アルバム
  INSERT INTO public.albums (id, owner_id, title, description, is_public, created_at)
  VALUES (
    gen_random_uuid(),
    target_user_id,
    '大学卒業式',
    '4年間の思い出が詰まった卒業式。仲間との別れと新しい門出。',
    false,
    now() - interval '60 days'
  )
  RETURNING id INTO graduation_album_id;
  
  RAISE NOTICE '大学卒業式アルバムを作成: %', graduation_album_id;
  
  RAISE NOTICE '✅ サンプルアルバムを4つ作成しました！';
  
  -- ====================================
  -- ステップ3: 各アルバムに写真を追加
  -- ====================================
  -- 注意: Unsplashの画像URLをサンプルデータとして使用します
  -- これらの写真はSupabase Storageには保存されません（URLとして保存されます）
  
  RAISE NOTICE '写真データを追加中...';
  
  -- 家族旅行アルバムの写真
  INSERT INTO public.photos (album_id, uploader_id, storage_key, caption, created_at)
  VALUES 
    (family_album_id, target_user_id, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80', '美しい沖縄の海！最高の景色でした。', now() - interval '5 days'),
    (family_album_id, target_user_id, 'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=1200&q=80', 'ビーチでリラックス', now() - interval '5 days'),
    (family_album_id, target_user_id, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', '夕暮れの海辺', now() - interval '5 days'),
    (family_album_id, target_user_id, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80', 'サンセットビーチ', now() - interval '4 days'),
    (family_album_id, target_user_id, 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200&q=80', '青い空と白い雲', now() - interval '4 days'),
    (family_album_id, target_user_id, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80', '家族みんなで海水浴', now() - interval '4 days');
  
  RAISE NOTICE '家族旅行アルバムに6枚の写真を追加';
  
  -- 結婚式アルバムの写真
  INSERT INTO public.photos (album_id, uploader_id, storage_key, caption, created_at)
  VALUES 
    (wedding_album_id, target_user_id, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80', '結婚式の会場', now() - interval '15 days'),
    (wedding_album_id, target_user_id, 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80', '新郎新婦の入場', now() - interval '15 days'),
    (wedding_album_id, target_user_id, 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80', 'ケーキカット', now() - interval '15 days'),
    (wedding_album_id, target_user_id, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80', '乾杯の瞬間', now() - interval '14 days'),
    (wedding_album_id, target_user_id, 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80', 'スピーチの時間', now() - interval '14 days'),
    (wedding_album_id, target_user_id, 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80', 'ダンスフロア', now() - interval '14 days'),
    (wedding_album_id, target_user_id, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80', 'ブーケトス', now() - interval '14 days'),
    (wedding_album_id, target_user_id, 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80', '最後の集合写真', now() - interval '14 days');
  
  RAISE NOTICE '結婚式アルバムに8枚の写真を追加';
  
  -- サッカー部春合宿アルバムの写真
  INSERT INTO public.photos (album_id, uploader_id, storage_key, caption, created_at)
  VALUES 
    (sports_album_id, target_user_id, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', '合宿所に到着', now() - interval '30 days'),
    (sports_album_id, target_user_id, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', '朝の練習', now() - interval '30 days'),
    (sports_album_id, target_user_id, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', 'チームミーティング', now() - interval '29 days'),
    (sports_album_id, target_user_id, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', '試合の様子', now() - interval '29 days'),
    (sports_album_id, target_user_id, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', '夕食の時間', now() - interval '29 days'),
    (sports_album_id, target_user_id, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', '夜のミーティング', now() - interval '28 days'),
    (sports_album_id, target_user_id, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', '最終日の集合写真', now() - interval '28 days');
  
  RAISE NOTICE 'サッカー部春合宿アルバムに7枚の写真を追加';
  
  -- 大学卒業式アルバムの写真
  INSERT INTO public.photos (album_id, uploader_id, storage_key, caption, created_at)
  VALUES 
    (graduation_album_id, target_user_id, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', '卒業式会場', now() - interval '60 days'),
    (graduation_album_id, target_user_id, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', '式の開始', now() - interval '60 days'),
    (graduation_album_id, target_user_id, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', '卒業証書授与', now() - interval '60 days'),
    (graduation_album_id, target_user_id, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', '記念撮影', now() - interval '60 days'),
    (graduation_album_id, target_user_id, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', '友人との集合写真', now() - interval '60 days'),
    (graduation_album_id, target_user_id, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', '家族との記念写真', now() - interval '60 days'),
    (graduation_album_id, target_user_id, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', '最後の集合写真', now() - interval '60 days');
  
  RAISE NOTICE '大学卒業式アルバムに7枚の写真を追加';
  
  RAISE NOTICE '✅ サンプル写真を追加しました（合計28枚）！';
  RAISE NOTICE '完了: サンプルアルバムのコピーが完了しました。';
  
END $$;

