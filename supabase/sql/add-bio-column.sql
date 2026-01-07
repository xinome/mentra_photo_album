-- ====================================
-- profilesテーブルにbioカラムを追加
-- ====================================
-- 既にbioカラムが存在する場合はエラーになりますが、問題ありません
-- ====================================

-- bioカラムを追加（既に存在する場合はスキップ）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN bio text;
  END IF;
END $$;

