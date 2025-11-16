# Supabase Magic Link リダイレクトURL設定ガイド

Magic Link認証がlocalhostでも正しく動作するように、Supabase側の設定を確認してください。

## 📋 確認・設定手順

### 1. Supabaseダッシュボードにアクセス

1. https://app.supabase.com にログイン
2. プロジェクト `uwzlvnjoobhasemypvqa` を選択

### 2. Authentication > URL Configuration を開く

1. 左メニューから **Authentication** をクリック
2. **URL Configuration** タブを選択

### 3. Redirect URLs に以下を追加

以下のURLを **Redirect URLs** リストに追加してください：

```
http://localhost:3000/auth/callback
http://127.0.0.1:3000/auth/callback
https://mentra-photo-album.vercel.app/auth/callback
```

**注意**: 
- 複数のURLを追加する場合は、1行に1つずつ入力
- 末尾に `/` は不要（`/auth/callback` で終わる）
- 追加後、**Save** ボタンをクリック

### 4. Site URL の確認

**Site URL** は本番環境のURLに設定されているはずです（開発環境では無視されます）：
```
https://mentra-photo-album.vercel.app
```

### 5. 設定確認

設定が完了したら、以下を確認してください：

- [ ] `http://localhost:3000/auth/callback` が Redirect URLs に追加されている
- [ ] `http://127.0.0.1:3000/auth/callback` が Redirect URLs に追加されている（オプション）
- [ ] 本番URLも追加されている

## 🔍 トラブルシューティング

### リダイレクトURLが本番のままになっている場合

**原因**: 
- Supabase側のRedirect URLsにlocalhostのURLが登録されていない
- または、ブラウザのキャッシュの問題

**解決方法**:
1. 上記の手順でRedirect URLsを確認・追加
2. ブラウザのコンソールで `[Auth] Magic LinkリダイレクトURL:` のログを確認
   - 期待値: `http://localhost:3000/auth/callback`
   - もし本番URLが表示される場合は、Supabase側の設定を確認
3. ブラウザのキャッシュをクリア（Ctrl+Shift+R または Cmd+Shift+R）

### コード側の確認

コード側では、`src/lib/config.ts` の `getAuthRedirectUrl()` 関数が動的にURLを生成します：

```typescript
export function getAuthRedirectUrl(): string {
  if (typeof window !== 'undefined') {
    const baseUrl = window.location.origin;
    return `${baseUrl}/auth/callback`;
  }
  // ...
}
```

ブラウザのコンソールで以下のログが表示されることを確認してください：
```
[Auth] Magic LinkリダイレクトURL: http://localhost:3000/auth/callback
[Auth] 現在のURL: http://localhost:3000/login
```

## 📝 参考

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Redirect URLs Configuration](https://supabase.com/docs/guides/auth/auth-redirect-urls)

