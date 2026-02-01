# 環境周りの調整（Vercel・GitHub Actions・Supabase）

> **GitHub Issue**: [#19](https://github.com/xinome/mentra_photo_album/issues/19)

## 📝 概要

Vercel デプロイ・GitHub Actions・Supabase まわりの環境設定を整理し、セキュリティ・CI/CD・運用の留意点に対応するためのタスク一覧です。

## ✅ 実装状況

### タスク1: Supabase アクセストークンの環境変数化 — 完了

**実施内容**
- `package.json` の supabase 系スクリプトから直書きトークンを削除
- `.env.example` を新規作成（`SUPABASE_ACCESS_TOKEN` を含む）
- `.gitignore` に `!.env.example` を追加
- `README.md` に Supabase CLI 用トークンの設定手順を追記
- `docs/setup/SETUP_GUIDE.md` / `SETUP_SUMMARY.md` の `.env.local.example` を `.env.example` に統一

**検証**
- Magic Link 経由のログインがローカル環境で正常に動作することを確認

### タスク2: Pre-Deploy Check のブランチ指定の見直し — 完了

**実施内容**
- 本番ブランチを `master` から `main` に移行する方針に合わせ、`.github/workflows/pre-deploy-check.yml` の `branches` を `main` に設定

### master → main ブランチ移行 — 完了

**実施内容**
- プロジェクト内の `main` 前提ファイルを更新（pre-deploy-check.yml、ドキュメント類）
- `docs/development/BRANCH_MAIN_MIGRATION.md` を新規作成（移行手順書）
- Git: ローカルで `master` を `main` にリネームし push
- GitHub: デフォルトブランチを `main` に変更
- Vercel: Settings → Environments → Production の **Branch Tracking** を `main` に変更

**検証**
- 手動で `main` ブランチから Production デプロイを実行し、正常に動作することを確認

### タスク3: CI ワークフロー（ci.yml）のパス修正 — 完了

**実施内容**
- `working-directory: apps/web` を削除し、ルートで実行する形に変更
- pnpm から npm に統一（pre-deploy-check と同様に `npm ci` / `npm run type-check` / `npm run build`）
- Node.js 20、actions/checkout@v4、actions/setup-node@v4 を使用

**検証**
- ローカルで `npm run type-check` が成功することを確認

### npm ci に --legacy-peer-deps を追加（CI 失敗対応）— 完了

**実施内容**
- `vercel.json` の `installCommand: "npm install --legacy-peer-deps"` に合わせ、GitHub Actions の `npm ci` に `--legacy-peer-deps` を追加
- `.github/workflows/ci.yml` および `.github/workflows/pre-deploy-check.yml` を更新

**検証**
- ローカルで `npm ci --legacy-peer-deps` → `npm run type-check` → `npm run build` が成功することを確認
- `@supabase/auth-helpers-nextjs` 非推奨の警告ありつつもビルドは成功（対応2 @supabase/ssr 移行は**当面不要**）

### CI 用 Supabase 環境変数のダミー設定 — 完了

**実施内容**
- GitHub Actions のビルド時、`NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が未設定でプリレンダリングが失敗する問題を対応
- 両ワークフローにダミー環境変数を追加（`https://placeholder.supabase.co` / `placeholder-anon-key-for-ci-build`）
- `pre-deploy-check.yml` の Node.js を 18 → 20 に更新、actions/checkout@v4、actions/setup-node@v4 に統一

**検証**
- main への push で CI / Pre-Deploy Check が成功することを確認

---

## 🎯 背景

- develop / main を SourceTree から PUSH すると Vercel でデプロイされる運用は問題なく動作している
- 以下の環境設定に改善・留意点があるため、タスク化して対応する

---

## ✅ 対応タスク一覧

### 1. Supabase アクセストークンの環境変数化（重要・セキュリティ） ✅ 完了

**現状**
- `package.json` の `supabase` 系スクリプトに `SUPABASE_ACCESS_TOKEN` が直書きされている
- リポジトリに含まれるため、push するとトークンが露出する

**対応内容**
- トークンを `package.json` から削除し、環境変数で渡すようにする
  - ローカル: `.env` またはシェルで `export SUPABASE_ACCESS_TOKEN=...`
  - CI: GitHub Secrets などで設定
- すでに push 済みの場合は、Supabase ダッシュボードでトークンの再発行を検討する

**変更ファイル**
- `package.json` - supabase 系スクリプトからトークン参照を削除し、環境変数前提の記載に変更

---

### 2. Pre-Deploy Check のブランチ指定の見直し ✅ 完了

**現状**
- `.github/workflows/pre-deploy-check.yml` は本番ブランチ向けに実行される必要がある
- 本番ブランチを `main` に統一したため、`branches` を `main` に設定

**対応内容**
- `branches` を `main` に設定（master から main への移行に伴い更新済み）

**変更ファイル**
- `.github/workflows/pre-deploy-check.yml` - `on.push.branches` / `on.pull_request.branches` を実際の本番ブランチに合わせる

---

### 3. CI ワークフロー（ci.yml）のパス修正 ✅ 完了

**現状**
- `.github/workflows/ci.yml` は `working-directory: apps/web` を指定していた
- 本リポジトリはルートに `package.json` と `src/` がある構成で、`apps/web` は存在しない

**対応内容**
- `working-directory: apps/web` を削除し、ルートで実行する形に変更
- pnpm から npm に統一（pre-deploy-check と同様）

**変更ファイル**
- `.github/workflows/ci.yml` - `defaults.run.working-directory` 削除、pnpm → npm 統一

---

### 4. npm ci に --legacy-peer-deps を追加 ✅ 完了

**現状**
- Vercel は `installCommand: "npm install --legacy-peer-deps"` を使用している
- GitHub Actions の `npm ci` は peer dependency の競合で失敗する場合がある

**対応内容**
- `ci.yml` および `pre-deploy-check.yml` の `npm ci` に `--legacy-peer-deps` を追加し、Vercel と統一

---

### 5. CI 用 Supabase 環境変数のダミー設定 ✅ 完了

**現状**
- GitHub Actions のビルド時、`NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が未設定でプリレンダリングが失敗する

**対応内容**
- 両ワークフローにダミー環境変数を追加（`https://placeholder.supabase.co` / `placeholder-anon-key-for-ci-build`）
- `pre-deploy-check.yml` の Node.js を 18 → 20 に更新、actions/checkout@v4、actions/setup-node@v4 に統一

---

### 6. Vercel の install コマンドと依存関係（参考）

**現状**
- `vercel.json` で `installCommand: "npm install --legacy-peer-deps"` を指定している
- 依存の不整合を `--legacy-peer-deps` で吸収している状態

**対応内容**
- 必須ではないが、余裕があれば依存の整理（バージョン揃え・非推奨パッケージの置き換え）を検討する
- ビルド時の `npm warn deprecated` 警告の解消は、このタイミングで検討可能

---

### 7. Supabase 認証パッケージの移行（将来対応）

**現状**
- `@supabase/auth-helpers-nextjs` は非推奨で、ビルド時に警告が出ている
- 公式では `@supabase/ssr` への移行が推奨されている

**対応内容**
- 現状は動作しているため必須ではない
- いずれ `@supabase/ssr` への移行を検討する

**変更ファイル（将来）**
- 認証まわりで `@supabase/auth-helpers-nextjs` を参照しているファイル一式
- `package.json` - 依存の差し替え

---

## 📁 変更ファイルまとめ

| 優先度 | ファイル | 変更内容 |
|--------|----------|----------|
| 高 | `package.json` | Supabase トークンを削除し環境変数前提に ✅ |
| 高 | `.github/workflows/pre-deploy-check.yml` | 本番ブランチを main に設定 ✅ |
| 高 | `.github/workflows/ci.yml` | `working-directory: apps/web` 削除、ルートで実行に変更 ✅ |
| 高 | `ci.yml` / `pre-deploy-check.yml` | `npm ci --legacy-peer-deps` を追加 ✅ |
| 高 | `ci.yml` / `pre-deploy-check.yml` | Supabase 環境変数ダミー設定を追加 ✅ |
| 中 | （将来）依存関係の整理 | `--legacy-peer-deps` が不要になるよう調整 |
| 低 | （将来）認証まわり | `@supabase/ssr` への移行 |

---

## ✅ 検証項目

- [x] Supabase 系スクリプトがローカルで環境変数で動作すること（Magic Link ログインで確認済み）
- [x] master → main 移行完了（Git、GitHub、Vercel の設定を手順通り実施済み）
- [x] main ブランチからの Production デプロイが成功すること（手動デプロイで確認済み）
- [ ] pre-deploy-check が main 向け PR で実行されること
- [x] ci ワークフローがルートでビルド・typecheck に成功すること
- [x] npm ci --legacy-peer-deps でインストール・ビルドが成功すること（ローカルで確認済み）

---

## 📚 関連

- [Vercel Promoting Deployments](https://vercel.com/docs/deployments/promoting-a-deployment)
- [Vercel Instant Rollback](https://vercel.com/docs/instant-rollback)
- 本番: develop → プレビュー、main → 本番デプロイの運用

---

## 📌 GitHub Issue の作成方法

この内容で GitHub Issue を作成する場合:

1. リポジトリの **Issues** タブを開く
2. **New issue** をクリック
3. **タイトル**: `環境周りの調整（Vercel・GitHub Actions・Supabase）`
4. **本文**: `docs/issues/ENVIRONMENT_SETUP_IMPROVEMENT_BODY.txt` の内容をコピー＆ペースト
5. **ラベル**: `enhancement` を付与（任意）
6. **Create issue** で作成

または、GitHub CLI が利用可能な環境では:

```bash
gh issue create --title "環境周りの調整（Vercel・GitHub Actions・Supabase）" --body-file docs/issues/ENVIRONMENT_SETUP_IMPROVEMENT_BODY.txt --label "enhancement"
```
