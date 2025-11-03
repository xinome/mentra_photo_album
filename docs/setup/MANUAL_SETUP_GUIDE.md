# 手動セットアップガイド（確実な方法）

SQLエラーが解決しない場合は、この手順で手動セットアップを行ってください。

## 📋 準備

1. [Supabase Dashboard](https://supabase.com/dashboard)を開く
2. プロジェクトを選択
3. 左サイドバーから**SQL Editor**をクリック

---

## ステップ1: テーブル作成（必須）

### 1-1. SQL Editorでテーブル作成

1. **New Query**をクリック
2. 以下のファイルの内容を**全てコピー&ペースト**:
   ```
   /supabase/sql/01-tables-only.sql
   ```
3. **Run**をクリック
4. "Success. No rows returned" が表示されればOK ✅

**エラーが出た場合**: 既にテーブルが存在する可能性があります。次のステップに進んでください。

### 1-2. テーブル作成の確認

1. 左サイドバー > **Table Editor**をクリック
2. 以下のテーブルが表示されることを確認:
   - ✅ profiles
   - ✅ albums
   - ✅ photos
   - ✅ shares
   - ✅ album_members
   - ✅ comments
   - ✅ photo_tags

---

## ステップ2: RLSポリシー設定（必須）

### 2-1. SQL EditorでRLS設定

1. **SQL Editor** > **New Query**
2. 以下のファイルの内容をコピー&ペースト:
   ```
   /supabase/sql/02-rls-policies.sql
   ```
3. **Run**をクリック
4. 成功したら完了 ✅

---

## ステップ3: ストレージバケット作成（手動推奨）

SQLではなく、UIから作成する方が確実です。

### 3-1. バケット作成

1. 左サイドバー > **Storage**をクリック
2. **Create a new bucket**をクリック
3. 設定:
   - **Name**: `photos`
   - **Public bucket**: ❌ オフ（チェックを外す）
   - **File size limit**: 50 MiB（デフォルト）
4. **Create bucket**をクリック

### 3-2. ストレージポリシー設定

`photos`バケットをクリックして、**Policies**タブを開く

#### ポリシー1: アップロード許可

1. **New Policy**をクリック
2. **Get started quickly** > **For full customization** を選択
3. 設定:
   - **Policy name**: `Users can upload photos`
   - **Allowed operation**: ✅ INSERT
   - **Target roles**: `authenticated`
4. **USING expression**に以下を入力:
   ```sql
   bucket_id = 'photos'
   ```
5. **Review**をクリック
6. **Save policy**をクリック

#### ポリシー2: 閲覧許可

1. **New Policy**をクリック
2. 設定:
   - **Policy name**: `Users can view photos`
   - **Allowed operation**: ✅ SELECT
   - **Target roles**: `authenticated`
3. **USING expression**:
   ```sql
   bucket_id = 'photos'
   ```
4. **Save policy**をクリック

#### ポリシー3: 削除許可

1. **New Policy**をクリック
2. 設定:
   - **Policy name**: `Users can delete photos`
   - **Allowed operation**: ✅ DELETE
   - **Target roles**: `authenticated`
3. **USING expression**:
   ```sql
   bucket_id = 'photos'
   ```
4. **Save policy**をクリック

---

## ステップ4: サンプルデータ追加（オプション）

Table Editorから手動でサンプルデータを追加します。

### 4-1. プロフィールデータ

**重要**: まず自分のユーザーIDを確認

1. **SQL Editor** > **New Query**
2. 以下を実行:
   ```sql
   SELECT id, email FROM auth.users;
   ```
3. 自分のユーザーIDをコピー

次に、プロフィールを作成:

1. **Table Editor** > **profiles**テーブルを開く
2. **Insert** > **Insert row**をクリック
3. 値を入力:
   - **user_id**: 上記でコピーしたID
   - **display_name**: 任意の名前（例: 山田太郎）
   - **bio**: 任意の自己紹介（例: 写真が好きです）
   - **avatar_url**: 空欄でOK
   - **created_at**: 自動入力
   - **updated_at**: 自動入力
4. **Save**をクリック

### 4-2. アルバムデータ

1. **Table Editor** > **albums**テーブルを開く
2. **Insert** > **Insert row**をクリック
3. 値を入力:
   - **id**: 自動生成（触らない）
   - **owner_id**: あなたのユーザーID（プロフィールと同じ）
   - **title**: `家族旅行 2024`
   - **description**: `沖縄旅行の思い出`
   - **is_public**: `false`
   - **created_at**: 自動入力
   - **updated_at**: 自動入力
4. **Save**をクリック

同様に、さらにアルバムを追加できます：

| title | description | is_public |
|-------|-------------|-----------|
| 田中家結婚式 | 2024年春の素敵な結婚式 | true |
| サッカー部春合宿 | 春合宿の楽しい思い出 | false |
| 大学卒業式 | 4年間の思い出 | false |

---

## ステップ5: 動作確認

### 5-1. アプリケーションをテスト

1. ブラウザで`http://localhost:3000`を開く
2. ログイン（Magic Link）
3. プロフィール設定画面が表示されたら:
   - 表示名を入力
   - 利用規約に同意
   - **「完了してアルバムを始める」**をクリック
4. アルバム一覧ページに遷移 ✅

### 5-2. 期待される表示

アルバム一覧ページで以下が表示されます：
- 📊 統計情報（総アルバム数、写真数、共有中）
- 📸 作成したアルバムのカード
- ➕ 「新しいアルバムを作成」ボタン

---

## 🐛 トラブルシューティング

### プロフィール保存エラー

**症状**: 「プロフィールの保存に失敗しました」

**確認事項**:
1. ✅ `profiles`テーブルが存在する
2. ✅ RLSポリシーが設定されている
3. ✅ ブラウザの開発者ツール（F12）でコンソールエラーを確認

**解決方法**:
```sql
-- SQL Editorで実行してRLSを確認
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'profiles';
```

結果が空の場合は、ステップ2を再実行してください。

### アルバムが表示されない

**症状**: アルバム一覧が空

**確認事項**:
1. Table Editor > `albums`でデータが存在するか確認
2. `owner_id`が自分のユーザーIDと一致しているか確認

**解決方法**:
```sql
-- SQL Editorで自分のアルバムを確認
SELECT id, title, owner_id 
FROM albums 
WHERE owner_id = auth.uid();
```

### ストレージエラー

**症状**: 写真がアップロードできない

**確認事項**:
1. Storage > `photos`バケットが存在する
2. ストレージポリシーが3つ設定されている

**解決方法**: ステップ3を再度実行してください

---

## ✅ 完了チェックリスト

セットアップが完了したか確認：

### データベース
- [ ] `profiles`テーブルが存在
- [ ] `albums`テーブルが存在
- [ ] `photos`テーブルが存在
- [ ] その他4つのテーブルが存在
- [ ] RLSポリシーが設定されている

### ストレージ
- [ ] `photos`バケットが存在
- [ ] ストレージポリシーが3つ設定されている

### データ
- [ ] 自分のプロフィールが作成されている
- [ ] サンプルアルバムが作成されている（オプション）

### アプリケーション
- [ ] プロフィール設定が保存できる
- [ ] アルバム一覧が表示される
- [ ] 新規アルバムが作成できる

すべてにチェックが入れば、セットアップ完了です！🎉

---

## 💡 次のステップ

1. 写真をアップロードしてみる
2. アルバムを共有してみる
3. 別のユーザーでログインしてテスト

楽しんでください！📸✨

