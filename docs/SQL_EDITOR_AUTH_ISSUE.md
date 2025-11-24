# SQL Editorでの認証エラーについて

## 問題

SupabaseダッシュボードのSQL Editorから直接SQLスクリプトを実行すると、以下のエラーが発生する場合があります：

```
ERROR: P0001: 認証されていません。ログインしてから実行してください。
```

## 原因

SupabaseダッシュボードのSQL Editorは、**管理者権限**で実行されます。そのため、`auth.uid()`は`NULL`を返します。これは、SQL Editorが特定のユーザーとして認証されていないためです。

## 解決方法

### 方法1: ユーザーIDを直接指定する（推奨）

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

2. **スクリプト内でユーザーIDを設定**
   - `copy-sample-albums.sql` または `delete-new-albums.sql` を開く
   - `current_user_id := 'YOUR_USER_ID_HERE'::uuid;` の行を見つける
   - コメントを外して、確認したユーザーIDを設定
   - 例: `current_user_id := '12345678-1234-1234-1234-123456789012'::uuid;`

3. **スクリプトを実行**

### 方法2: 最新のユーザーIDを自動取得

スクリプト内で以下のコードを使用すると、最新のユーザーIDを自動取得できます：

```sql
SELECT id INTO current_user_id 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 1;
```

**注意**: 複数のユーザーがいる場合、最新のユーザーIDが使用されます。特定のユーザーを指定したい場合は、方法1を使用してください。

### 方法3: アプリケーション側から実行（将来的な実装）

アプリケーション側からSupabaseクライアント経由で実行する方法もありますが、現在の実装ではSQL Editorからの実行を想定しています。

## 修正済みスクリプト

以下のスクリプトは、上記の問題に対応するように修正されています：

- `supabase/sql/copy-sample-albums.sql`
- `supabase/sql/delete-new-albums.sql`

これらのスクリプトには、ユーザーIDを確認するステップと、ユーザーIDを設定する方法が含まれています。

## 実行手順（修正後）

### サンプルアルバムのコピー

1. **ステップ1: ユーザーIDの確認**
   ```sql
   SELECT 
     id,
     email,
     created_at
   FROM auth.users
   ORDER BY created_at DESC
   LIMIT 10;
   ```

2. **ステップ2: スクリプトを編集**
   - `copy-sample-albums.sql` を開く
   - 以下の行を見つける：
     ```sql
     -- current_user_id := 'YOUR_USER_ID_HERE'::uuid;
     ```
   - コメントを外して、確認したユーザーIDを設定：
     ```sql
     current_user_id := '12345678-1234-1234-1234-123456789012'::uuid;
     ```

3. **ステップ3: スクリプトを実行**
   - SQL Editorでスクリプト全体を実行

### 「新しいアルバム」の削除

同様の手順で、`delete-new-albums.sql` を実行してください。

## 参考

- [Supabase SQL Editor Documentation](https://supabase.com/docs/guides/database/overview)
- [Supabase Auth Functions](https://supabase.com/docs/guides/auth/managing-user-data)

