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
WHERE owner_id = auth.uid() AND is_public = false;

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

