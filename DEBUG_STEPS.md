# アルバムページ接続エラーのデバッグ手順

## エラー内容

### アプリ起因の可能性があるエラー
```
Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
```

### コンソールによく出る「拡張機能由来」のエラー（アプリの不具合ではない）

次のメッセージは **ブラウザ拡張機能** が原因で、**本アプリのコードとは無関係** です。

- `Unchecked runtime.lastError: The message port closed before a response was received.`
- `chrome-extension://...-worker-loader.js: Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.`

**理由:** 拡張機能が `chrome.runtime.sendMessage` などでページやワーカーにメッセージを送った際に、受け側がまだ存在しない・応答しなかった・ポートが閉じた場合に Chrome が表示します。本アプリでは `chrome.*` や拡張 API は一切使っていません。

**対処:** 無視して問題ありません。気になる場合はシークレットモードで開くか、`chrome://extensions/` で拡張を一つずつ無効化して原因の拡張を特定してください（React DevTools・Redux DevTools・広告ブロッカー・Grammarly などで出ることが多いです）。

---

## 🔍 原因の特定

### ステップ1: ブラウザ拡張機能の問題を除外

このエラーは **99%ブラウザ拡張機能が原因** です。

1. **シークレット/プライベートウィンドウ**で試す
   - Chrome: `Ctrl+Shift+N` (Windows) / `Cmd+Shift+N` (Mac)
   - Safari: `Cmd+Shift+N`
   - Firefox: `Ctrl+Shift+P` (Windows) / `Cmd+Shift+P` (Mac)

2. http://localhost:3000 にアクセス

3. マジックリンクでログイン

4. `/albums` ページを確認

**結果:**
- ✅ 正常に動作する → ブラウザ拡張機能が原因
- ❌ エラーが出る → ステップ2へ

### ステップ2: デバッグページで詳細確認

アプリケーション側の問題を確認します。

#### 2-1. デバッグページを有効化

以下のコマンドを実行：

```bash
cd /Users/ikomasatoru/Desktop/workspace/個人開発プロジェクト/mentra_photo_album
mv src/app/albums/page.tsx src/app/albums/page.tsx.backup
mv src/app/albums/debug-page.tsx src/app/albums/page.tsx
```

#### 2-2. デバッグページにアクセス

1. ブラウザで http://localhost:3000/albums にアクセス
2. デバッグ情報が表示されます

#### 2-3. 結果を確認

**ケースA: 緑色の成功メッセージが表示される**
```
✅ すべての接続が正常です！
```
→ アプリケーションは正常です。ブラウザ拡張機能の問題です。

**ケースB: 赤色のエラーが表示される**
```
❌ エラー
• 接続エラー: [エラーメッセージ]
```
→ エラーメッセージの内容によって対処します（下記参照）

#### 2-4. 元に戻す

デバッグが終わったら：

```bash
mv src/app/albums/page.tsx src/app/albums/debug-page.tsx
mv src/app/albums/page.tsx.backup src/app/albums/page.tsx
```

## 🔧 エラー別の対処法

### エラー1: `relation "public.albums" does not exist`

**原因:** データベーステーブルが作成されていない

**解決方法:**
1. Supabaseダッシュボード > SQL Editor
2. `supabase/sql/01-tables-only.sql` を実行
3. `supabase/sql/02-rls-policies.sql` を実行

### エラー2: `permission denied for table albums`

**原因:** RLSポリシーが正しく設定されていない

**解決方法:**
1. Supabaseダッシュボード > SQL Editor
2. `supabase/sql/02-rls-policies.sql` を実行

### エラー3: `JWT expired` または `Invalid JWT`

**原因:** 認証トークンが期限切れ

**解決方法:**
1. 一度ログアウト
2. 再度マジックリンクでログイン

### エラー4: `Failed to fetch`

**原因:** Supabase接続設定が間違っている

**解決方法:**
1. `.env.local` ファイルを確認
2. `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が正しいか確認
3. 開発サーバーを再起動: `npm run dev`

### エラー5: アルバム数が0件

**原因:** サンプルデータが投入されていない、または別のユーザーでログインしている

**解決方法:**
1. Supabaseダッシュボード > SQL Editor で確認:
   ```sql
   SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;
   ```
2. 現在ログインしているユーザーのIDを確認
3. そのユーザーで `sample-data.sql` を実行したか確認
4. 実行していない場合は、`supabase/sql/sample-data.sql` を実行

## 🎯 よくある原因トップ3

### 1位: ブラウザ拡張機能（90%）

**症状:**
- シークレットモードでは動作する
- デバッグページでは「すべて正常」と表示される
- 通常ブラウザでだけエラーが出る

**解決方法:**
- シークレットモードを使用する
- または、問題のある拡張機能を特定して無効化する

**よくある原因の拡張機能:**
- React DevTools
- Redux DevTools
- Grammarly
- 広告ブロッカー
- セキュリティ関連の拡張機能

### 2位: 環境変数の設定ミス（5%）

**症状:**
- デバッグページで「接続エラー」または「Failed to fetch」
- コンソールに `ERR_NAME_NOT_RESOLVED` エラー

**解決方法:**
1. `.env.local` ファイルを確認
2. 正しいSupabase URLとキーを設定
3. 開発サーバーを再起動

### 3位: RLSポリシーの問題（3%）

**症状:**
- デバッグページで「permission denied」エラー
- アルバムが0件と表示される（実際はデータがある）

**解決方法:**
- `02-rls-policies.sql` を実行

## 📞 サポート

上記で解決しない場合、以下の情報を共有してください：

1. **ブラウザ:** Chrome / Safari / Firefox / その他
2. **シークレットモードでの動作:** 正常 / エラー
3. **デバッグページの結果:** スクリーンショットまたはエラーメッセージ全文
4. **ブラウザコンソールのエラー:** F12 → Console タブの内容

## ✅ チェックリスト

問題解決前に以下を確認してください：

- [ ] シークレットモードで試した
- [ ] `.env.local` が存在し、正しい値が設定されている
- [ ] 開発サーバーを再起動した
- [ ] `01-tables-only.sql` を実行済み
- [ ] `02-rls-policies.sql` を実行済み
- [ ] `sample-data.sql` を実行済み
- [ ] ブラウザのコンソールでエラーを確認した
- [ ] デバッグページで詳細を確認した

