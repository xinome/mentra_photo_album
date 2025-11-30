-- ====================================
-- アルバムカテゴリ更新スクリプト
-- ====================================
-- このスクリプトは、指定された4つのアルバムのカテゴリを更新します
-- 
-- 更新内容:
-- - 家族旅行 → 家族 (family)
-- - 田中家結婚式 → 結婚式 (wedding)
-- - サッカー部合宿 → スポーツ (sports)
-- - 大学卒業式 → イベント (event)
-- ====================================

-- ====================================
-- ステップ1: カテゴリカラムが存在しない場合は追加
-- ====================================
DO $$
BEGIN
  -- カテゴリカラムが存在しない場合は追加
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'albums' 
      AND column_name = 'category'
  ) THEN
    ALTER TABLE public.albums 
    ADD COLUMN category text CHECK (category IN ('wedding', 'event', 'family', 'sports', 'other'));
    
    RAISE NOTICE '✅ カテゴリカラムを追加しました';
  ELSE
    RAISE NOTICE 'ℹ️  カテゴリカラムは既に存在します';
  END IF;
END $$;

-- ====================================
-- ステップ2: 指定されたアルバムのカテゴリを更新
-- ====================================
UPDATE public.albums
SET 
  category = CASE 
    WHEN title = '家族旅行' OR title = '家族旅行 2024 沖縄' OR title LIKE '家族旅行%' THEN 'family'
    WHEN title = '田中家結婚式' OR title LIKE '%結婚式%' THEN 'wedding'
    WHEN title = 'サッカー部合宿' OR title = 'サッカー部春合宿 2024' OR title LIKE '%サッカー部%合宿%' THEN 'sports'
    WHEN title = '大学卒業式' OR title LIKE '%卒業式%' THEN 'event'
    ELSE category
  END,
  updated_at = now()
WHERE 
  title IN ('家族旅行', '家族旅行 2024 沖縄', '田中家結婚式', 'サッカー部合宿', 'サッカー部春合宿 2024', '大学卒業式')
  OR title LIKE '家族旅行%'
  OR title LIKE '%結婚式%'
  OR (title LIKE '%サッカー部%' AND title LIKE '%合宿%')
  OR title LIKE '%卒業式%';

-- ====================================
-- ステップ3: 更新結果の確認
-- ====================================
SELECT 
  id,
  title,
  category,
  updated_at
FROM public.albums
WHERE 
  title IN ('家族旅行', '家族旅行 2024 沖縄', '田中家結婚式', 'サッカー部合宿', 'サッカー部春合宿 2024', '大学卒業式')
  OR title LIKE '家族旅行%'
  OR title LIKE '%結婚式%'
  OR (title LIKE '%サッカー部%' AND title LIKE '%合宿%')
  OR title LIKE '%卒業式%'
ORDER BY 
  CASE 
    WHEN title LIKE '家族旅行%' THEN 1
    WHEN title LIKE '%結婚式%' THEN 2
    WHEN title LIKE '%サッカー部%' THEN 3
    WHEN title LIKE '%卒業式%' THEN 4
    ELSE 5
  END;

-- ====================================
-- 完了メッセージ
-- ====================================
DO $$
DECLARE
  updated_count integer;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM public.albums
  WHERE category IS NOT NULL
    AND (
      title IN ('家族旅行', '家族旅行 2024 沖縄', '田中家結婚式', 'サッカー部合宿', 'サッカー部春合宿 2024', '大学卒業式')
      OR title LIKE '家族旅行%'
      OR title LIKE '%結婚式%'
      OR (title LIKE '%サッカー部%' AND title LIKE '%合宿%')
      OR title LIKE '%卒業式%'
    );
  
  RAISE NOTICE '✅ カテゴリ更新が完了しました。更新されたアルバム数: %', updated_count;
END $$;

