# データ検証ガイド

## 概要

このガイドでは、Supabaseのデータを検証して、SQLスクリプトが正しく実行されたかを確認する方法を説明します。

## 重要な注意事項

### サンプルアルバムの写真について

**サンプルアルバムの写真はSupabase Storageには保存されません。**

- サンプルデータの写真は、**Unsplashの画像URL**を`storage_key`として直接保存しています
- これは、実際のファイルをアップロードせずにサンプルデータを表示するための仕様です
- 詳細は `docs/data/SAMPLE_ALBUM_IMAGE_SOURCE.md` を参照

**つまり、「photosバケットの中に入ってきていない」のは正常な動作です。**

## 検証手順

### ステップ1: データ検証スクリプトを実行

1. **Supabaseダッシュボードにアクセス**
   - [Supabase Dashboard](https://app.supabase.com/) にログイン
   - プロジェクトを選択

2. **SQL Editorを開く**
   - 左メニューから **SQL Editor** をクリック
   - **New query** をクリック

3. **検証スクリプトを実行**
   - `supabase/sql/verify-data.sql` の内容をコピー
   - SQL Editorに貼り付けて実行
   - **Run** ボタンをクリック

4. **結果を確認**
   - 各ステップの結果を確認して、データの状態を把握

### ステップ2: ユーザーIDの確認

検証スクリプトの「ステップ1」で、すべてのユーザーが表示されます。localhostでログインしているユーザーのIDを確認してください。

### ステップ3: アルバムの確認

検証スクリプトの「ステップ2」で、すべてのアルバムが表示されます。以下を確認してください：

- **owner_id**: あなたのユーザーIDと一致しているか
- **title**: サンプルアルバムのタイトルが存在するか
- **photo_count**: 各アルバムの写真数が正しいか

### ステップ4: 「新しいアルバム」の確認

検証スクリプトの「ステップ3」で、「新しいアルバム」が表示されます。以下を確認してください：

- **owner_id**: あなたのユーザーIDと一致しているか
- **photo_count**: 関連する写真が存在するか

### ステップ5: 写真データの確認

検証スクリプトの「ステップ5」で、写真データが表示されます。以下を確認してください：

- **storage_type**: "Unsplash URL" と表示される（これは正常）
- **album_id**: 正しいアルバムIDに関連付けられているか
- **storage_key**: UnsplashのURLが保存されているか

## 問題の特定と解決

### 問題1: サンプルアルバムが作成されていない

**原因の可能性:**
- ユーザーIDが正しく設定されていない
- SQLスクリプトがエラーなく実行されていない

**解決方法:**
1. 検証スクリプトの「ステップ1」でユーザーIDを確認
2. `copy-sample-albums.sql` を開き、ユーザーIDを直接設定：
   ```sql
   current_user_id := 'YOUR_USER_ID_HERE'::uuid;
   ```
3. スクリプトを再実行

### 問題2: 「新しいアルバム」が削除されていない

**原因の可能性:**
- ユーザーIDが正しく設定されていない
- タイトルが完全一致していない（スペースや文字の違い）

**解決方法:**
1. 検証スクリプトの「ステップ3」で「新しいアルバム」を確認
2. `owner_id` があなたのユーザーIDと一致しているか確認
3. `delete-new-albums.sql` を開き、ユーザーIDを直接設定：
   ```sql
   current_user_id := 'YOUR_USER_ID_HERE'::uuid;
   ```
4. スクリプトを再実行

### 問題3: 写真がphotosバケットに入っていない

**これは正常な動作です。**

サンプルアルバムの写真は、UnsplashのURLを`storage_key`として保存しているため、Supabase Storageには保存されません。

- **サンプルデータ**: Unsplash URL（Storageには保存されない）
- **新規作成したアルバム**: 実際のファイル（Storageに保存される）

## 手動での確認方法

### ユーザーIDの確認

```sql
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;
```

### 特定ユーザーのアルバム確認

```sql
-- YOUR_USER_ID_HERE を実際のユーザーIDに置き換えてください
SELECT 
  a.id,
  a.title,
  a.owner_id,
  a.created_at,
  COUNT(p.id) as photo_count
FROM public.albums a
LEFT JOIN public.photos p ON p.album_id = a.id
WHERE a.owner_id = 'YOUR_USER_ID_HERE'::uuid
GROUP BY a.id, a.title, a.owner_id, a.created_at
ORDER BY a.created_at DESC;
```

### 「新しいアルバム」の確認

```sql
-- YOUR_USER_ID_HERE を実際のユーザーIDに置き換えてください
SELECT 
  a.id,
  a.title,
  a.owner_id,
  a.created_at,
  COUNT(p.id) as photo_count
FROM public.albums a
LEFT JOIN public.photos p ON p.album_id = a.id
WHERE a.title = '新しいアルバム'
  AND a.owner_id = 'YOUR_USER_ID_HERE'::uuid
GROUP BY a.id, a.title, a.owner_id, a.created_at
ORDER BY a.created_at DESC;
```

### 写真データの確認

```sql
SELECT 
  p.id,
  p.album_id,
  a.title as album_title,
  p.storage_key,
  CASE 
    WHEN p.storage_key LIKE 'http%' THEN 'Unsplash URL'
    ELSE 'Supabase Storage'
  END as storage_type
FROM public.photos p
LEFT JOIN public.albums a ON p.album_id = a.id
ORDER BY p.created_at DESC
LIMIT 50;
```

## トラブルシューティング

### エラー: "relation does not exist"

- **原因**: テーブルが作成されていない
- **解決方法**: `supabase/sql/complete-setup.sql` を実行

### エラー: "permission denied"

- **原因**: RLSポリシーの問題
- **解決方法**: `supabase/sql/complete-setup.sql` のRLSポリシー部分を再実行

### データが表示されない

- **原因**: ユーザーIDが一致していない
- **解決方法**: 検証スクリプトでユーザーIDを確認し、SQLスクリプトで正しいユーザーIDを設定

