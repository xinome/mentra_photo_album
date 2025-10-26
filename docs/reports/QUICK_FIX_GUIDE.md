# 🔧 クイック修正ガイド

## 問題: SQLエラー「column "user_id" does not exist」

### エラーの原因

ストレージのRLSポリシーで存在しないカラムを参照していました。修正済みのSQLスクリプトを使用してください。

## ✅ 解決手順（10分で完了）

### 推奨: 段階的セットアップ

エラーを避けるため、3つのステップに分けて実行します。

#### ステップ1-1: テーブル作成

1. **Supabase Dashboard**を開く
   - [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. プロジェクトを選択

3. 左サイドバー > **SQL Editor**をクリック

4. **New Query**をクリック

5. `01-tables-only.sql`の内容を**全てコピー&ペースト**
   - ファイル: `/supabase/sql/01-tables-only.sql`

6. **Run**ボタンをクリック

7. 成功メッセージを確認
   ```
   Success. No rows returned
   ```

#### ステップ1-2: RLSポリシー設定

1. **SQL Editor**で**New Query**をクリック

2. `02-rls-policies.sql`の内容をコピー&ペースト
   - ファイル: `/supabase/sql/02-rls-policies.sql`

3. **Run**をクリック

#### ステップ1-3: ストレージバケット作成（手動）

1. 左サイドバー > **Storage**をクリック

2. **Create a new bucket**をクリック

3. 設定:
   - Name: `photos`
   - Public bucket: **オフ**

4. **Create bucket**をクリック

### 代替: 手動セットアップ

SQLでエラーが続く場合は、[手動セットアップガイド](MANUAL_SETUP_GUIDE.md)を参照してください。

### ステップ2: テーブル作成を確認

1. 左サイドバー > **Table Editor**をクリック

2. 以下のテーブルが表示されることを確認：
   - ✅ profiles
   - ✅ albums
   - ✅ photos
   - ✅ shares
   - ✅ album_members
   - ✅ comments
   - ✅ photo_tags

### ステップ3: ストレージバケットを確認

1. 左サイドバー > **Storage**をクリック

2. `photos`バケットが表示されることを確認

3. もし表示されない場合：
   - **Create a new bucket**をクリック
   - Name: `photos`
   - Public bucket: **オフ**
   - **Create bucket**をクリック

### ステップ4: プロフィール設定をテスト

1. ブラウザでアプリケーションをリロード（F5）

2. プロフィール設定画面（`http://localhost:3000/account/setup`）にアクセス

3. 情報を入力：
   - 表示名: 任意の名前
   - 自己紹介（オプション）
   - ✅ 利用規約に同意

4. **「完了してアルバムを始める」**ボタンをクリック

5. **期待結果**: アルバム一覧ページにリダイレクトされる ✨

## 📊 サンプルデータの追加（オプション）

アルバムのサンプルデータを追加して、アプリの見た目を確認できます。

### 方法1: SQLで一括追加（推奨）

1. **SQL Editor**を開く

2. **New Query**をクリック

3. `sample-data.sql`の内容をコピー&ペースト
   - ファイル: `/supabase/sql/sample-data.sql`

4. **Run**をクリック

5. 4つのサンプルアルバムが作成されます：
   - 家族旅行 2024 沖縄
   - 田中家結婚式
   - サッカー部春合宿 2024
   - 大学卒業式

### 方法2: アプリから手動追加

1. アルバム一覧ページで**「新しいアルバムを作成」**をクリック

2. タイトルと説明を入力して保存

3. アルバム詳細ページで写真をアップロード

## 🐛 トラブルシューティング

### エラーが続く場合

**確認事項**:

1. ✅ `.env.local`に正しいSupabase URLとAPIキーが設定されている
2. ✅ ブラウザのキャッシュをクリア（Ctrl+Shift+Delete）
3. ✅ 開発サーバーを再起動（Ctrl+C → `npm run dev`）
4. ✅ ブラウザの開発者ツール（F12）でコンソールエラーを確認

### よくあるエラー

| エラーメッセージ | 原因 | 解決方法 |
|-----------------|------|---------|
| `relation "public.profiles" does not exist` | テーブル未作成 | ステップ1を実行 |
| `permission denied for table profiles` | RLS未設定 | complete-setup.sqlを再実行 |
| `duplicate key value` | データ重複 | Table Editorから既存データを削除 |
| `Failed to fetch` | 環境変数エラー | .env.localを確認 |

### デバッグSQLクエリ

問題を診断するための便利なSQLクエリ：

```sql
-- テーブル一覧を確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 自分のユーザーIDを確認
SELECT id, email FROM auth.users WHERE id = auth.uid();

-- 自分のプロフィールを確認
SELECT * FROM profiles WHERE user_id = auth.uid();

-- 自分のアルバムを確認
SELECT id, title, created_at 
FROM albums 
WHERE owner_id = auth.uid()
ORDER BY created_at DESC;

-- ストレージバケットを確認
SELECT * FROM storage.buckets;

-- RLSポリシーを確認
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

## 📚 関連ドキュメント

- [TABLE_STRUCTURE.md](TABLE_STRUCTURE.md) - テーブル構造の詳細
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - データベースセットアップ詳細
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - 全体のセットアップガイド

## ✨ 完了チェックリスト

実装が正しく動作しているか確認：

- [ ] SQLスクリプトが正常に実行された
- [ ] テーブルが作成されている（7つ）
- [ ] ストレージバケット`photos`が作成されている
- [ ] プロフィール設定が保存できる
- [ ] アルバム一覧ページが表示される
- [ ] アルバムを新規作成できる
- [ ] サンプルデータが表示される（追加した場合）

すべてにチェックが入ったら、セットアップ完了です！🎉

---

## 💡 次のステップ

セットアップが完了したら：

1. 写真をアップロードしてみる
2. アルバムを共有してみる
3. プロフィールを編集してみる（アカウント設定ページ）
4. 別のユーザーでログインしてアルバムを共同編集

楽しんでください！📸✨

