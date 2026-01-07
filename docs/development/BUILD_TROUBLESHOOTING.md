# ビルドトラブルシューティング

## 🔍 ビルドが止まる・再試行される場合

### 症状
- `Generating static pages (12/14)` から `Generating static pages (0/14)` に戻る
- ビルドが完了しない
- メモリエラーが発生する

### 原因
認証が必要なサーバーコンポーネントが静的生成を試みている場合、ビルド時にSupabase接続が失敗し、再試行が発生します。

### 解決策

#### 1. 動的レンダリングを強制する
認証が必要なページには `export const dynamic = 'force-dynamic'` を追加：

```typescript
// ページの先頭に追加
export const dynamic = 'force-dynamic';
```

#### 2. クライアントコンポーネントを使用する
認証が必要なページは `"use client"` を使用：

```typescript
"use client";

export default function MyPage() {
  // ...
}
```

#### 3. ビルド設定を確認する
`next.config.js` で静的生成を無効化：

```javascript
const nextConfig = {
  output: 'standalone', // または 'export' を削除
  // ...
};
```

## 🚀 ビルドを高速化する方法

### 1. 不要な静的生成を避ける
- 認証が必要なページは動的レンダリングを使用
- 静的生成が必要なページのみ静的生成を有効化

### 2. メモリ使用量を削減
- 大きな画像やファイルを最適化
- 不要な依存関係を削除

### 3. ビルドキャッシュを活用
- `.next` ディレクトリを保持
- CI/CDでキャッシュを設定

## 📝 チェックリスト

ビルド前に確認：
- [ ] 認証が必要なページに `export const dynamic = 'force-dynamic'` が設定されている
- [ ] 型エラーがない（`npm run type-check`）
- [ ] ビルドが成功する（`npm run build`）
- [ ] メモリ不足のエラーがない

