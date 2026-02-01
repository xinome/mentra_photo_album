# GitHub Issue インデックス（main ブランチ対応）

本リポジトリの GitHub Issue 一覧です。ブランチ `master` から `main` への移行後も **Issue 番号はそのまま維持** されています。

## 📌 運用方針

- **本番ブランチ**: `main`
- **Issue 番号**: リポジトリ単位で永続的（ブランチ変更の影響なし）
- **PR のベース**: `main` を指定

## 📋 Issue 一覧（番号順）

| # | 状態 | タイトル | 関連ドキュメント | URL |
|---|------|----------|------------------|-----|
| 2 | ✅ CLOSED | 📝 [実装ログ] Phase 1: Magic Link認証のエラーハンドリング実装 | create-phase-issue Phase 1 | [#2](https://github.com/xinome/mentra_photo_album/issues/2) |
| 3 | OPEN | テスト | - | [#3](https://github.com/xinome/mentra_photo_album/issues/3) |
| 4 | ✅ CLOSED | 📝 [実装] Phase 2: ログイン後のプロフィールチェックと遷移ロジック | create-phase-issue Phase 2 | [#4](https://github.com/xinome/mentra_photo_album/issues/4) |
| 5 | ✅ CLOSED | 🔧 [修正] アルバム一覧の写真数表示と全アルバム表示機能の実装 | STEP1_IMPLEMENTATION.md | [#5](https://github.com/xinome/mentra_photo_album/issues/5) |
| 6 | ✅ CLOSED | docs: バイブコーディング作業引き継ぎ整備 | project/HANDOVER.md | [#6](https://github.com/xinome/mentra_photo_album/issues/6) |
| 7 | ✅ CLOSED | feat: Step 1 実装完了 - ダッシュボードとアルバム一覧の分離 | STEP1_IMPLEMENTATION.md, STEP1_BODY.txt | [#7](https://github.com/xinome/mentra_photo_album/issues/7) |
| 8 | ✅ CLOSED | feat: Step 2 アルバム作成画面のUI改善とアイキャッチ画像の設定機能を追加 | ALBUM_CREATOR_IMPROVEMENT.md | [#8](https://github.com/xinome/mentra_photo_album/issues/8) |
| 9 | ✅ CLOSED | ✨ [Phase 1] アカウント設定ページの実装（基本機能） | - | [#9](https://github.com/xinome/mentra_photo_album/issues/9) |
| 10 | ✅ CLOSED | ✨ [Phase 3] ストレージページの実装 | - | [#10](https://github.com/xinome/mentra_photo_album/issues/10) |
| 11 | ✅ CLOSED | ✨ [Phase 3] ストレージページの実装 | - | [#11](https://github.com/xinome/mentra_photo_album/issues/11) |
| 12 | ✅ CLOSED | ✨ [Phase 4] アルバム詳細ページの写真機能追加 | - | [#12](https://github.com/xinome/mentra_photo_album/issues/12) |
| 13 | ✅ CLOSED | UI/UX改善: ドロップダウン背景・レスポンシブ調整・Snackbar統一 | - | [#13](https://github.com/xinome/mentra_photo_album/issues/13) |
| 14 | ✅ CLOSED | ✨ アルバム・写真削除機能の実装 | DELETE_FEATURE.md | [#14](https://github.com/xinome/mentra_photo_album/issues/14) |
| 15 | ✅ CLOSED | アルバム編集機能の不具合修正と改善 | ALBUM_EDIT_IMPROVEMENT_BODY.txt | [#15](https://github.com/xinome/mentra_photo_album/issues/15) |
| 16 | ✅ CLOSED | 📝 ドキュメント整備: docs/配下の整理と整合性チェック | DOCUMENTATION_REORGANIZATION.md | [#16](https://github.com/xinome/mentra_photo_album/issues/16) |
| 17 | ✅ CLOSED | 🔧 Function形式からアロー関数式へのリファクタリング | REFACTOR_FUNCTION_TO_ARROW.md | [#17](https://github.com/xinome/mentra_photo_album/issues/17) |
| 18 | ✅ CLOSED | ダッシュボード・アルバム一覧でアイキャッチ画像が表示されない問題 | ALBUM_THUMBNAIL_ISSUE.md | [#18](https://github.com/xinome/mentra_photo_album/issues/18) |
| 19 | OPEN | 環境周りの調整（Vercel・GitHub Actions・Supabase） | ENVIRONMENT_SETUP_IMPROVEMENT.md | [#19](https://github.com/xinome/mentra_photo_album/issues/19) |

## 📁 docs/issues と Issue 番号の対応

| ドキュメント | GitHub Issue |
|--------------|--------------|
| ENVIRONMENT_SETUP_IMPROVEMENT.md | #19 |
| ENVIRONMENT_SETUP_IMPROVEMENT_BODY.txt | #19 |
| ALBUM_THUMBNAIL_ISSUE.md | #18 |
| REFACTOR_FUNCTION_TO_ARROW.md | #17 |
| REFACTOR_FUNCTION_TO_ARROW_BODY.txt | #17 |
| DOCUMENTATION_REORGANIZATION.md | #16 |
| ALBUM_EDIT_IMPROVEMENT_BODY.txt | #15 |
| DELETE_FEATURE.md | #14 |
| ALBUM_CREATOR_IMPROVEMENT.md | #8 |
| ALBUM_CREATOR_IMPROVEMENT_BODY.txt | #8 |
| STEP1_IMPLEMENTATION.md | #5, #7 |
| STEP1_BODY.txt | #7 |

## 📌 補足

- **Issue 番号の維持**: GitHub の Issue はリポジトリ単位で管理されるため、ブランチ名の変更（master → main）により番号が変わることはありません
- **新規 Issue**: `.github/ISSUE_TEMPLATE/` を使用し、本番ブランチ `main` 前提で作成してください
- **PR 作成時**: `main` をベースブランチに指定し、`Closes #XX` で関連 Issue を参照してください
