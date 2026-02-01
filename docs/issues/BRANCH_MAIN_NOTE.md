# Issue・PR の main ブランチ対応について

## 📌 概要

本リポジトリの本番ブランチは `main` です。
Issue・PR の作成・運用は `main` を前提にしてください。

## 🔄 運用方針

| 項目 | 内容 |
|------|------|
| 本番ブランチ | `main` |
| PR のベースブランチ | `main` を指定 |
| Pre-Deploy Check | `main` 向け PR で自動実行 |
| マージ先 | `main` へのマージで本番反映 |

## 📁 関連ファイル

- [Issue インデックス（番号一覧）](ISSUE_INDEX.md) - GitHub Issue #2〜#19 の一覧・番号対応
- [PR テンプレート](../../.github/PULL_REQUEST_TEMPLATE.md)
- [Issue テンプレート](../../.github/ISSUE_TEMPLATE/)
- [Issue 作成ガイド](TEMPLATE.md)
- [ブランチ移行ガイド](../development/BRANCH_MAIN_MIGRATION.md)
