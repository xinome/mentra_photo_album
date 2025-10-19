-- ====================================
-- ステップ3: ストレージバケット設定（オプション）
-- ====================================
-- 前提: 01-tables-only.sql, 02-rls-policies.sql が実行済み
-- 
-- 注意: このスクリプトはエラーが出る可能性があります
-- エラーが出た場合は、ダッシュボードから手動で作成してください
-- ====================================

-- ストレージバケット作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', false)
ON CONFLICT (id) DO NOTHING;

-- ====================================
-- ストレージバケットを手動で作成する方法
-- ====================================
-- もしSQLでエラーが出る場合は、以下の手順で手動作成してください：
-- 
-- 1. Supabaseダッシュボード > Storage をクリック
-- 2. "Create a new bucket" をクリック
-- 3. 設定:
--    - Name: photos
--    - Public bucket: オフ
-- 4. "Create bucket" をクリック
-- 
-- その後、以下のポリシーを手動で設定（Storage > photos > Policies）:
-- 
-- ポリシー1: Users can upload photos
-- - Policy name: Users can upload photos
-- - Target roles: authenticated
-- - Policy command: INSERT
-- - USING expression: bucket_id = 'photos'
-- 
-- ポリシー2: Users can view photos
-- - Policy name: Users can view photos
-- - Target roles: authenticated
-- - Policy command: SELECT
-- - USING expression: bucket_id = 'photos'
-- 
-- ポリシー3: Users can delete photos
-- - Policy name: Users can delete photos
-- - Target roles: authenticated
-- - Policy command: DELETE
-- - USING expression: bucket_id = 'photos'

