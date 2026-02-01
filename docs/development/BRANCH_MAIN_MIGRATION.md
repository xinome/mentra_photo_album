# master → main ブランチ移行ガイド

本番ブランチを `master` から `main` に移行するための手順です。

## 📋 事前準備

プロジェクト内の以下のファイルはすでに `main` 前提で更新済みです：

- `.github/workflows/pre-deploy-check.yml` - branches: main
- `docs/issues/ENVIRONMENT_SETUP_IMPROVEMENT.md`
- `docs/issues/ENVIRONMENT_SETUP_IMPROVEMENT_BODY.txt`
- `docs/development/DEPLOYMENT_WORKFLOW.md`（もともと main 記載）

## 🚀 移行手順

### 1. ローカルでブランチをリネーム

```bash
git checkout master
git branch -m master main
```

### 2. main をリモートに push

```bash
git push -u origin main
```

### 3. GitHub でデフォルトブランチを変更

1. リポジトリの **Settings** を開く
2. 左メニューから **Branches** を選択
3. **Default branch** の右側にある **Switch to another branch** をクリック
4. **main** を選択して **Update** をクリック
5. 確認ダイアログで **I understand, update the default branch** をクリック

### 4. Vercel で Production Branch を変更

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. 対象プロジェクト（mentra_photo_album）を開く
3. **Settings** タブをクリック
4. 左メニューから **Git** を選択
5. **Production Branch** セクションを探す
6. 現在 `master` になっている場合、**Edit** をクリック
7. ブランチ名を `main` に変更して **Save** をクリック

![Vercel Production Branch の場所: Settings > Git > Production Branch]

### 5. （任意）リモートの master ブランチを削除

```bash
git push origin --delete master
```

### 6. ローカルのトラッキングを確認

```bash
git branch -a
# * main が表示され、origin/main がトラッキングされていることを確認
```

## ✅ 移行後の確認

- [ ] `main` に push すると Vercel で本番デプロイが実行される
- [ ] `main` 向けの PR で Pre-Deploy Check が実行される
- [ ] develop → main へのマージで本番デプロイが行われる

## 📚 参考

- [GitHub: Renaming a branch](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/renaming-a-branch)
- [Vercel: Git Integration](https://vercel.com/docs/concepts/git)
