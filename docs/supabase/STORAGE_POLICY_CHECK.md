# Supabase StorageポリシーとRLSポリシーの確認方法

## 概要

Supabase Storageへのファイルアップロードが失敗する場合、StorageポリシーとRLSポリシーの設定を確認する必要があります。

## 確認手順

### 1. Supabaseダッシュボードにアクセス

1. [Supabase Dashboard](https://app.supabase.com/) にログイン
2. プロジェクトを選択

### 2. Storageポリシーの確認

#### 2.1 Storageバケットの確認

1. 左メニューから **Storage** をクリック
2. `photos` バケットが存在するか確認
3. バケットが存在しない場合は作成：
   - **Create a new bucket** をクリック
   - Name: `photos`
   - Public bucket: **オフ**（非公開）
   - **Create bucket** をクリック

#### 2.2 Storageポリシーの確認

1. `photos` バケットをクリック
2. **Policies** タブをクリック
3. 以下のポリシーが存在するか確認：

##### ポリシー1: Users can upload photos (INSERT)

- **Policy name**: `Users can upload photos`
- **Target roles**: `authenticated`
- **Policy command**: `INSERT`
- **WITH CHECK expression**:
  ```sql
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
  ```

##### ポリシー2: Users can view photos (SELECT)

- **Policy name**: `Users can view photos`
- **Target roles**: `authenticated`
- **Policy command**: `SELECT`
- **USING expression**:
  ```sql
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
  ```

##### ポリシー3: Users can update own photos (UPDATE)

- **Policy name**: `Users can update own photos`
- **Target roles**: `authenticated`
- **Policy command**: `UPDATE`
- **USING expression**:
  ```sql
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
  ```
- **WITH CHECK expression**:
  ```sql
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
  ```

##### ポリシー4: Users can delete own photos (DELETE)

- **Policy name**: `Users can delete own photos`
- **Target roles**: `authenticated`
- **Policy command**: `DELETE`
- **USING expression**:
  ```sql
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
  ```

#### 2.3 ポリシーが存在しない場合の作成方法

1. **Policies** タブで **New Policy** をクリック
2. **Create policy from scratch** を選択
3. 上記の各ポリシーを1つずつ作成

### 3. RLSポリシーの確認（データベーステーブル）

#### 3.1 albumsテーブルのRLSポリシー

1. 左メニューから **Table Editor** をクリック
2. `albums` テーブルを選択
3. **Policies** タブをクリック
4. 以下のポリシーが存在するか確認：

##### albums_insert ポリシー

- **Policy name**: `albums_insert`
- **Policy command**: `INSERT`
- **WITH CHECK expression**:
  ```sql
  auth.uid() = owner_id
  ```

#### 3.2 photosテーブルのRLSポリシー

1. `photos` テーブルを選択
2. **Policies** タブをクリック
3. 以下のポリシーが存在するか確認：

##### photos_insert ポリシー

- **Policy name**: `photos_insert`
- **Policy command**: `INSERT`
- **WITH CHECK expression**:
  ```sql
  EXISTS (
    SELECT 1
    FROM public.albums a
    WHERE a.id = photos.album_id
      AND a.owner_id = auth.uid()
  )
  ```

### 4. SQLエディタでの確認

#### 4.1 Storageポリシーの確認

1. 左メニューから **SQL Editor** をクリック
2. 以下のクエリを実行：

```sql
-- Storageポリシーの確認
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%photos%';
```

#### 4.2 RLSポリシーの確認

```sql
-- albumsテーブルのRLSポリシー確認
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'albums';

-- photosテーブルのRLSポリシー確認
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'photos';
```

### 5. ポリシーの再作成（必要に応じて）

ポリシーが存在しない、または正しく設定されていない場合は、以下のSQLを実行：

```sql
-- Storageポリシーの削除と再作成
DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;

-- 認証済みユーザーが写真をアップロード可能
CREATE POLICY "Users can upload photos" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

-- 認証済みユーザーが写真を閲覧可能
CREATE POLICY "Users can view photos" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

-- 認証済みユーザーが自分の写真を更新可能
CREATE POLICY "Users can update own photos" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

-- 認証済みユーザーが自分の写真を削除可能
CREATE POLICY "Users can delete own photos" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);
```

## トラブルシューティング

### エラー: "Invalid key"

- **原因**: ファイル名に日本語や特殊文字が含まれている
- **解決策**: ファイル名を英数字のみに変換（実装済み）

### エラー: "new row violates row-level security policy"

- **原因**: RLSポリシーが正しく設定されていない
- **解決策**: 上記の手順でRLSポリシーを確認・再作成

### エラー: "new row violates policy"

- **原因**: Storageポリシーが正しく設定されていない
- **解決策**: 上記の手順でStorageポリシーを確認・再作成

### エラー: "bucket not found"

- **原因**: `photos` バケットが存在しない
- **解決策**: Storageダッシュボードでバケットを作成

## 参考資料

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

