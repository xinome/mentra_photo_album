-- ====================================
-- サンプルデータ投入スクリプト
-- ====================================
-- 注意: このスクリプトは開発環境でのテスト用です
-- 本番環境では実行しないでください
-- 
-- 前提条件:
-- 1. complete-setup.sql が実行済み
-- 2. 2人以上のユーザーが auth.users に登録されている
--    （Magic Linkでログインして作成）
-- ====================================

-- ====================================
-- 1. プロフィールのサンプルデータ
-- ====================================
-- 注意: user_id は実際にログインしたユーザーのIDに置き換えてください
-- 
-- 自分のユーザーIDを確認するSQL:
-- SELECT id, email FROM auth.users;
-- 
-- 以下はサンプルです（実際のIDに置き換えてください）

-- 例: ユーザー1のプロフィール
-- INSERT INTO public.profiles (user_id, display_name, avatar_url, bio)
-- VALUES (
--   'your-user-id-here'::uuid,
--   '山田太郎',
--   NULL,
--   '写真が好きです。休日は家族と過ごすことが多いです。'
-- )
-- ON CONFLICT (user_id) DO UPDATE
-- SET display_name = EXCLUDED.display_name,
--     bio = EXCLUDED.bio,
--     updated_at = now();

-- ====================================
-- 2. アルバムのサンプルデータ
-- ====================================
-- 重要: まず自分のユーザーIDを確認してから実行してください

-- ステップ1: 自分のユーザーIDを確認
-- 以下のクエリを実行してユーザーIDをコピーしてください
DO $$
DECLARE
  current_user_id uuid;
BEGIN
  SELECT id INTO current_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'ユーザーが見つかりません。まずログインしてください。';
  END IF;
  
  RAISE NOTICE 'あなたのユーザーID: %', current_user_id;
  
  -- ステップ2: サンプルアルバムを作成
  -- 家族旅行アルバム
  INSERT INTO public.albums (id, owner_id, title, description, is_public)
  VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    current_user_id,
    '家族旅行 2024 沖縄',
    '2024年夏の沖縄旅行の思い出。美しいビーチと美味しい料理を楽しみました。',
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET title = EXCLUDED.title,
      description = EXCLUDED.description,
      updated_at = now();

  -- 結婚式アルバム（公開）
  INSERT INTO public.albums (id, owner_id, title, description, is_public)
  VALUES (
    '22222222-2222-2222-2222-222222222222'::uuid,
    current_user_id,
    '田中家結婚式',
    '2024年春の素敵な結婚式。新郎新婦の幸せな笑顔が印象的でした。',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET title = EXCLUDED.title,
      description = EXCLUDED.description,
      updated_at = now();

  -- サッカー部合宿アルバム
  INSERT INTO public.albums (id, owner_id, title, description, is_public)
  VALUES (
    '33333333-3333-3333-3333-333333333333'::uuid,
    current_user_id,
    'サッカー部春合宿 2024',
    '春合宿の楽しい思い出。チームワークが深まった3日間。',
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET title = EXCLUDED.title,
      description = EXCLUDED.description,
      updated_at = now();

  -- 卒業式アルバム
  INSERT INTO public.albums (id, owner_id, title, description, is_public)
  VALUES (
    '44444444-4444-4444-4444-444444444444'::uuid,
    current_user_id,
    '大学卒業式',
    '4年間の思い出が詰まった卒業式。仲間との別れと新しい門出。',
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET title = EXCLUDED.title,
      description = EXCLUDED.description,
      updated_at = now();
  
  RAISE NOTICE '✅ サンプルアルバムを4つ作成しました！';
  
  -- ====================================
  -- ステップ3: 写真のサンプルデータ
  -- ====================================
  -- 注意: Unsplashの画像URLをサンプルデータとして使用します
  
  -- 家族旅行アルバムの写真
  INSERT INTO public.photos (album_id, uploader_id, storage_key, caption, created_at)
  VALUES 
    ('11111111-1111-1111-1111-111111111111'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80', 
     '美しい沖縄の海！最高の景色でした。', now() - interval '5 days'),
    ('11111111-1111-1111-1111-111111111111'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=1200&q=80', 
     'ビーチでリラックス', now() - interval '5 days'),
    ('11111111-1111-1111-1111-111111111111'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', 
     '夕暮れの海辺', now() - interval '5 days'),
    ('11111111-1111-1111-1111-111111111111'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80', 
     'サンセットビーチ', now() - interval '4 days'),
    ('11111111-1111-1111-1111-111111111111'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200&q=80', 
     '青い空と白い雲', now() - interval '4 days'),
    ('11111111-1111-1111-1111-111111111111'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80', 
     '家族みんなで海水浴', now() - interval '4 days');

  -- 結婚式アルバムの写真
  INSERT INTO public.photos (album_id, uploader_id, storage_key, caption, created_at)
  VALUES 
    ('22222222-2222-2222-2222-222222222222'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80', 
     '幸せな新郎新婦', now() - interval '10 days'),
    ('22222222-2222-2222-2222-222222222222'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=80', 
     '美しいウェディングドレス', now() - interval '10 days'),
    ('22222222-2222-2222-2222-222222222222'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80', 
     'ケーキカット', now() - interval '10 days'),
    ('22222222-2222-2222-2222-222222222222'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1594486222654-4af67b57c485?w=1200&q=80', 
     'チャペルでのセレモニー', now() - interval '10 days'),
    ('22222222-2222-2222-2222-222222222222'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80', 
     'ブーケトス', now() - interval '10 days'),
    ('22222222-2222-2222-2222-222222222222'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80', 
     '素敵な笑顔', now() - interval '10 days'),
    ('22222222-2222-2222-2222-222222222222'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1200&q=80', 
     '披露宴の様子', now() - interval '10 days'),
    ('22222222-2222-2222-2222-222222222222'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80', 
     '幸せいっぱいの一日', now() - interval '10 days');

  -- サッカー部合宿アルバムの写真
  INSERT INTO public.photos (album_id, uploader_id, storage_key, caption, created_at)
  VALUES 
    ('33333333-3333-3333-3333-333333333333'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', 
     '試合開始！', now() - interval '15 days'),
    ('33333333-3333-3333-3333-333333333333'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80', 
     'ナイスシュート！', now() - interval '15 days'),
    ('33333333-3333-3333-3333-333333333333'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1200&q=80', 
     'チームで円陣', now() - interval '15 days'),
    ('33333333-3333-3333-3333-333333333333'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=1200&q=80', 
     '練習風景', now() - interval '15 days'),
    ('33333333-3333-3333-3333-333333333333'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1200&q=80', 
     'みんなで記念撮影', now() - interval '15 days'),
    ('33333333-3333-3333-3333-333333333333'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80', 
     '最高のチームワーク', now() - interval '14 days');

  -- 卒業式アルバムの写真
  INSERT INTO public.photos (album_id, uploader_id, storage_key, caption, created_at)
  VALUES 
    ('44444444-4444-4444-4444-444444444444'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', 
     '卒業おめでとう！', now() - interval '20 days'),
    ('44444444-4444-4444-4444-444444444444'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80', 
     'みんなで帽子投げ', now() - interval '20 days'),
    ('44444444-4444-4444-4444-444444444444'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80', 
     'キャンパスでの最後の思い出', now() - interval '20 days'),
    ('44444444-4444-4444-4444-444444444444'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1200&q=80', 
     '卒業証書授与式', now() - interval '20 days'),
    ('44444444-4444-4444-4444-444444444444'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1627556704243-64efaa08de75?w=1200&q=80', 
     '仲間との別れ', now() - interval '20 days'),
    ('44444444-4444-4444-4444-444444444444'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80', 
     '新しい門出へ', now() - interval '20 days'),
    ('44444444-4444-4444-4444-444444444444'::uuid, current_user_id, 
     'https://images.unsplash.com/photo-1622495970927-147c92b1bfb7?w=1200&q=80', 
     '4年間ありがとう', now() - interval '19 days');
  
  RAISE NOTICE '✅ サンプル写真を各アルバムに追加しました（合計27枚）！';
END $$;

-- ====================================
-- サンプルデータの確認
-- ====================================
-- 投入したデータを確認するSQL

-- プロフィールの確認
SELECT 
  user_id,
  display_name,
  bio,
  created_at
FROM public.profiles
WHERE user_id = auth.uid();

-- アルバムの確認
SELECT 
  id,
  title,
  description,
  is_public,
  created_at
FROM public.albums
WHERE owner_id = auth.uid()
ORDER BY created_at DESC;

-- 統計情報
SELECT 
  'Total Albums' as metric,
  COUNT(*) as count
FROM public.albums
WHERE owner_id = auth.uid()
UNION ALL
SELECT 
  'Public Albums' as metric,
  COUNT(*) as count
FROM public.albums
WHERE owner_id = auth.uid() AND is_public = true
UNION ALL
SELECT 
  'Private Albums' as metric,
  COUNT(*) as count
FROM public.albums
WHERE owner_id = auth.uid() AND is_public = false
UNION ALL
SELECT 
  'Total Photos' as metric,
  COUNT(*) as count
FROM public.photos
WHERE uploader_id = auth.uid();

-- 各アルバムの写真数
SELECT 
  a.title as album_title,
  COUNT(p.id) as photo_count
FROM public.albums a
LEFT JOIN public.photos p ON a.id = p.album_id
WHERE a.owner_id = auth.uid()
GROUP BY a.id, a.title
ORDER BY a.created_at DESC;

-- ====================================
-- 写真データについて
-- ====================================
-- 写真データは実際にファイルをアップロードする必要があります
-- アプリケーションから以下の手順で写真をアップロードしてください：
-- 
-- 1. ログイン
-- 2. アルバム一覧ページでアルバムを選択
-- 3. アルバム詳細ページで写真をアップロード
-- 
-- または、既存の写真アップロード機能を使用してください

-- ====================================
-- クリーンアップ（必要な場合）
-- ====================================
-- サンプルデータを削除する場合は以下を実行

-- アルバムの削除（写真も自動的に削除されます）
-- DELETE FROM public.albums 
-- WHERE owner_id = auth.uid() 
--   AND id IN (
--     '11111111-1111-1111-1111-111111111111',
--     '22222222-2222-2222-2222-222222222222',
--     '33333333-3333-3333-3333-333333333333',
--     '44444444-4444-4444-4444-444444444444'
--   );

-- ====================================
-- 完了
-- ====================================
-- サンプルデータの投入が完了しました
-- アプリケーションをリロードして確認してください

