# サンプルデータ管理ガイド

## 概要

このガイドでは、Supabaseにサンプルアルバムをコピーしたり、「新しいアルバム」を削除する方法を説明します。

## ⚠️ 重要な注意事項

### サンプルアルバムの写真について

**サンプルアルバムの写真はSupabase Storageには保存されません。**

- サンプルデータの写真は、**Unsplashの画像URL**を`storage_key`として直接保存しています
- これは、実際のファイルをアップロードせずにサンプルデータを表示するための仕様です
- **「photosバケットの中に入ってきていない」のは正常な動作です**
- 詳細は `docs/SAMPLE_ALBUM_IMAGE_SOURCE.md` を参照

**写真を実際にStorageに保存したい場合**:
- `docs/PHOTO_STORAGE_MIGRATION.md` を参照してください
- SQLだけでは画像をStorageに保存することはできません
- アプリケーション側で実装する必要があります

### データ検証について

SQLスクリプトを実行した後、データが正しく作成されたか確認するには：
- `supabase/sql/verify-data.sql` を実行してデータの状態を確認
- 詳細は `docs/DATA_VERIFICATION_GUIDE.md` を参照

## 1. サンプルアルバムのコピー

### 目的

指定したユーザーに対して、以下のサンプルアルバムをSupabaseにコピーします：
- 家族旅行 2024 沖縄
- 田中家結婚式
- サッカー部春合宿 2024
- 大学卒業式

### 実行方法

1. **Supabaseダッシュボードにアクセス**
   - [Supabase Dashboard](https://app.supabase.com/) にログイン
   - プロジェクトを選択

2. **SQL Editorを開く**
   - 左メニューから **SQL Editor** をクリック
   - **New query** をクリック

3. **ステップ1: ユーザーIDの確認**
   - 以下のクエリを実行して、自分のユーザーIDを確認：
     ```sql
     SELECT 
       id,
       email,
       created_at
     FROM auth.users
     ORDER BY created_at DESC
     LIMIT 10;
     ```
   - 表示されたユーザーIDをコピー（例: `12345678-1234-1234-1234-123456789012`）

4. **ステップ2: スクリプトを編集**
   - `supabase/sql/copy-sample-albums.sql` を開く
   - 以下の行を見つける：
     ```sql
     -- current_user_id := 'YOUR_USER_ID_HERE'::uuid;
     ```
   - コメントを外して、確認したユーザーIDを設定：
     ```sql
     current_user_id := '12345678-1234-1234-1234-123456789012'::uuid;
     ```
   - または、最新のユーザーIDを自動取得する場合は、そのまま実行（複数ユーザーがいる場合は注意）

5. **ステップ3: スクリプトを実行**
   - 編集したスクリプトの内容をSQL Editorに貼り付け
   - **Run** ボタンをクリック

6. **結果の確認**
   - 成功メッセージが表示されます：
     ```
     対象ユーザーID: 12345678-1234-1234-1234-123456789012
     ✅ サンプルアルバムを4つ作成しました！
     ✅ サンプル写真を追加しました（合計28枚）！
     完了: サンプルアルバムのコピーが完了しました。
     ```

7. **データ検証（推奨）**
   - `supabase/sql/verify-data.sql` を実行して、データが正しく作成されたか確認
   - 詳細は `docs/DATA_VERIFICATION_GUIDE.md` を参照

8. **アプリケーションで確認**
   - アプリケーションをリロード
   - アルバム一覧に4つのサンプルアルバムが表示されることを確認
   - **注意**: サンプルアルバムの写真はUnsplashのURLを使用しているため、Supabase Storageには保存されません（正常な動作）

### 注意事項

- **既存のサンプルアルバムがある場合**：
  - 同じタイトルのアルバムは削除されてから再作成されます
  - 既存の写真データも削除されます

- **ユーザーIDの指定**：
  - SQL Editorから実行する場合、`auth.uid()`は`NULL`を返すため、ユーザーIDを直接指定する必要があります
  - 詳細は `docs/SQL_EDITOR_AUTH_ISSUE.md` を参照

- **画像の参照先**：
  - サンプルデータの画像はUnsplashのURLを使用しています
  - 実際のファイルはSupabase Storageには保存されません
  - 詳細は `docs/SAMPLE_ALBUM_IMAGE_SOURCE.md` を参照

## 2. 「新しいアルバム」の削除

### 目的

以前の実装で自動作成された「新しいアルバム」を削除します。

### 実行方法

#### 方法1: SQLスクリプトを使用（推奨）

1. **Supabaseダッシュボードにアクセス**
   - [Supabase Dashboard](https://app.supabase.com/) にログイン
   - プロジェクトを選択

2. **SQL Editorを開く**
   - 左メニューから **SQL Editor** をクリック
   - **New query** をクリック

3. **ステップ1: ユーザーIDの確認**
   - 以下のクエリを実行して、自分のユーザーIDを確認：
     ```sql
     SELECT 
       id,
       email,
       created_at
     FROM auth.users
     ORDER BY created_at DESC
     LIMIT 10;
     ```
   - 表示されたユーザーIDをコピー

4. **ステップ2: スクリプトを選択**
   - **方法A（推奨）**: `supabase/sql/fix-delete-new-albums.sql` を使用
     - このスクリプトは、ユーザーIDを直接設定する形式になっています
     - より確実に動作します
   - **方法B**: `supabase/sql/delete-new-albums.sql` を使用
     - 最新のユーザーIDを自動取得します

5. **ステップ3: スクリプトを編集（方法Aの場合）**
   - `supabase/sql/fix-delete-new-albums.sql` を開く
   - 以下の行を見つける：
     ```sql
   target_user_id uuid := 'YOUR_USER_ID_HERE'::uuid;  -- ここにユーザーIDを設定
     ```
   - `YOUR_USER_ID_HERE` を確認したユーザーIDに置き換える：
     ```sql
   target_user_id uuid := '12345678-1234-1234-1234-123456789012'::uuid;
     ```

6. **ステップ4: スクリプトを実行**
   - 編集したスクリプトの内容をSQL Editorに貼り付け
   - **Run** ボタンをクリック

7. **結果の確認**
   - 成功メッセージが表示されます：
     ```
     対象ユーザーID: 12345678-1234-1234-1234-123456789012
     削除対象の「新しいアルバム」: X 件
     削除した写真数: Y
     ✅ 「新しいアルバム」を X 件削除しました
     ```
   - アプリケーションをリロードして確認

#### 方法2: ダッシュボードから手動削除

1. **Table Editorを開く**
   - 左メニューから **Table Editor** をクリック
   - `albums` テーブルを選択

2. **フィルターを適用**
   - フィルターで `title = '新しいアルバム'` を設定
   - または、手動で「新しいアルバム」を検索

3. **削除**
   - 該当する行を選択
   - **Delete** ボタンをクリック
   - 確認ダイアログで **Confirm** をクリック

4. **関連する写真も削除**
   - `photos` テーブルを開く
   - 削除したアルバムのIDに関連する写真を削除

### 注意事項

- **関連データの削除**：
  - アルバムを削除する前に、関連する写真データも削除する必要があります
  - 上記のSQLスクリプトは自動的に関連データを削除します

- **削除の確認**：
  - 削除後は元に戻せません
  - 重要なデータがある場合は事前にバックアップを取ってください

## 3. 重複アルバムの削除

同名のアルバムが複数ある場合、古い方を削除して最新のものだけを残します。

### 実行方法

1. **Supabaseダッシュボードにアクセス**
   - [Supabase Dashboard](https://app.supabase.com/) にログイン
   - プロジェクトを選択

2. **SQL Editorを開く**
   - 左メニューから **SQL Editor** をクリック
   - **New query** をクリック

3. **ステップ1: ユーザーIDの確認**
   - `supabase/sql/cleanup-duplicate-albums.sql` の「ステップ1」を実行
   - ユーザーIDを確認

4. **ステップ2: 重複の確認**
   - `supabase/sql/cleanup-duplicate-albums.sql` の「ステップ2」を実行
   - 重複しているアルバムを確認

5. **ステップ3: スクリプトを編集**
   - `supabase/sql/cleanup-duplicate-albums.sql` を開く
   - `target_user_id` にユーザーIDを設定

6. **ステップ4: スクリプトを実行**
   - 編集したスクリプト全体をSQL Editorに貼り付けて実行

7. **ステップ5: 削除後の確認**
   - スクリプトの「ステップ4」を実行して、各タイトルごとに1つだけ存在することを確認

### 注意事項

- **削除されるデータ**: 各タイトルごとに、最新のアルバム以外が削除されます
- **関連データ**: アルバムを削除すると、関連する写真データも自動的に削除されます
- **復元不可**: 削除後は元に戻せません。重要なデータがある場合は事前にバックアップを取ってください

## 4. 一括操作（サンプルアルバムのコピー + 「新しいアルバム」の削除 + 重複削除）

すべての操作を一度に実行したい場合は、以下の手順で実行してください：

1. **ユーザーIDを確認**
   ```sql
   SELECT 
     id,
     email,
     created_at
   FROM auth.users
   ORDER BY created_at DESC
   LIMIT 10;
   ```

2. **修正版スクリプトを使用（順番に実行）**
   - `supabase/sql/fix-delete-new-albums.sql` を実行（ユーザーIDを設定）
   - `supabase/sql/cleanup-duplicate-albums.sql` を実行（ユーザーIDを設定）
   - `supabase/sql/fix-sample-albums.sql` を実行（ユーザーIDを設定）

**注意**: すべてのスクリプトで同じユーザーIDを使用してください。

## トラブルシューティング

### エラー: "認証されていません"

- **原因**: ログインしていない状態でスクリプトを実行した
- **解決策**: アプリケーションでログインしてから、Supabaseダッシュボードでスクリプトを実行

### エラー: "permission denied"

- **原因**: RLSポリシーにより、他のユーザーのデータにアクセスできない
- **解決策**: スクリプトは現在ログインしているユーザーのデータのみを操作します。正しいユーザーでログインしているか確認してください

### サンプルアルバムが表示されない

- **原因**: データが正しく作成されていない、またはRLSポリシーの問題、またはユーザーIDが一致していない
- **解決策**: 
  1. `supabase/sql/verify-data.sql` を実行してデータを確認
  2. ユーザーIDが正しく設定されているか確認
  3. `fix-sample-albums.sql` を使用して再実行（ユーザーIDを直接設定）
  4. アプリケーションをリロード
  5. ブラウザのコンソールでエラーを確認

### 写真がphotosバケットに入っていない

- **原因**: これは正常な動作です
- **説明**: 
  - サンプルアルバムの写真は、UnsplashのURLを`storage_key`として保存しています
  - 実際のファイルはSupabase Storageには保存されません
  - 新規作成したアルバムの写真のみ、Supabase Storageに保存されます

## 参考資料

- [Supabase SQL Editor Documentation](https://supabase.com/docs/guides/database/overview)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

