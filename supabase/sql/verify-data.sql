-- ====================================
-- データ検証スクリプト
-- ====================================
-- このスクリプトは、Supabaseのデータを検証するために使用します
-- SQL Editorで実行して、データの状態を確認してください
-- ====================================

-- ====================================
-- ステップ1: ユーザーIDの確認
-- ====================================
-- すべてのユーザーを表示
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- ====================================
-- ステップ2: アルバムの確認
-- ====================================
-- すべてのアルバムを表示（owner_idとタイトルを含む）
SELECT 
  a.id,
  a.title,
  a.owner_id,
  a.is_public,
  a.created_at,
  u.email as owner_email,
  COUNT(p.id) as photo_count
FROM public.albums a
LEFT JOIN auth.users u ON a.owner_id = u.id
LEFT JOIN public.photos p ON p.album_id = a.id
GROUP BY a.id, a.title, a.owner_id, a.is_public, a.created_at, u.email
ORDER BY a.created_at DESC;

-- ====================================
-- ステップ3: 「新しいアルバム」の確認
-- ====================================
-- タイトルが「新しいアルバム」のアルバムを確認
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
GROUP BY a.id, a.title, a.owner_id, a.created_at, u.email
ORDER BY a.created_at DESC;

-- ====================================
-- ステップ4: サンプルアルバムの確認
-- ====================================
-- サンプルアルバム（家族旅行、結婚式、サッカー部、卒業式）を確認
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
WHERE a.title IN ('家族旅行 2024 沖縄', '田中家結婚式', 'サッカー部春合宿 2024', '大学卒業式')
GROUP BY a.id, a.title, a.owner_id, a.created_at, u.email
ORDER BY a.created_at DESC;

-- ====================================
-- ステップ5: 写真データの確認
-- ====================================
-- 各アルバムの写真データを確認
SELECT 
  p.id,
  p.album_id,
  a.title as album_title,
  p.storage_key,
  p.caption,
  p.created_at,
  CASE 
    WHEN p.storage_key LIKE 'http%' THEN 'Unsplash URL'
    ELSE 'Supabase Storage'
  END as storage_type
FROM public.photos p
LEFT JOIN public.albums a ON p.album_id = a.id
ORDER BY p.created_at DESC
LIMIT 50;

-- ====================================
-- ステップ6: 特定ユーザーのアルバム確認
-- ====================================
-- 特定のユーザーIDのアルバムを確認する場合
-- 以下の 'YOUR_USER_ID_HERE' を実際のユーザーIDに置き換えて実行してください
-- 
-- SELECT 
--   a.id,
--   a.title,
--   a.owner_id,
--   a.created_at,
--   COUNT(p.id) as photo_count
-- FROM public.albums a
-- LEFT JOIN public.photos p ON p.album_id = a.id
-- WHERE a.owner_id = 'YOUR_USER_ID_HERE'::uuid
-- GROUP BY a.id, a.title, a.owner_id, a.created_at
-- ORDER BY a.created_at DESC;

