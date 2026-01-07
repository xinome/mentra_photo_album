# クイックデプロイガイド

## 🚀 デプロイ前の3ステップ

### Step 1: 型チェック
```bash
npm run type-check
```
✅ エラーが0件であることを確認

### Step 2: ビルド確認
```bash
npm run build
```
✅ ビルドが成功することを確認

### Step 3: コミット & プッシュ
```bash
git add .
git commit -m "feat: 機能の説明"
git push
```

## ⚠️ エラーが出た場合

### 型エラーの場合
1. エラーメッセージを確認
2. 該当ファイルを修正
3. 再度 `npm run type-check` を実行

### ビルドエラーの場合
1. エラーメッセージを確認
2. 該当ファイルを修正
3. 再度 `npm run build` を実行

## 💡 ワンライナー

すべてのチェックを一度に実行：
```bash
npm run pre-deploy
```

成功したらコミット・プッシュ：
```bash
git add . && git commit -m "feat: 機能の説明" && git push
```

## 📝 注意事項

- **必ずローカルでビルド確認してからプッシュ**
- **型エラーは放置しない**
- **エラーが出たら修正してから再実行**

