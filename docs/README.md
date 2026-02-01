# 開発者向けドキュメント

このディレクトリには、Mentra Photo Albumプロジェクトの開発者向けドキュメントが整理されています。

## 📁 ドキュメント構成

```
docs/
├── project/              # プロジェクト概要・引き継ぎ
│   ├── HANDOVER.md       # バイブコーディング作業引き継ぎテキスト（重要）
│   ├── IMPLEMENTATION_STATUS.md  # 実装状況（重要）
│   ├── DEVELOPMENT_GUIDE.md      # 開発ガイド（重要）
│   └── ALBUM_CREATION_ISSUES.md  # アルバム作成実装の問題点（過去の問題点、解決済み）
│
├── setup/                # セットアップ関連
│   ├── SETUP_GUIDE.md    # セットアップガイド（詳細手順）
│   ├── SETUP_SUMMARY.md  # セットアップ方法まとめ（比較表付き）
│   └── MANUAL_SETUP_GUIDE.md  # 手動セットアップガイド
│
├── development/          # 開発・検証・デプロイメント関連
│   ├── QUICK_FIX_GUIDE.md      # クイック修正ガイド（重要）
│   ├── BUILD_TROUBLESHOOTING.md
│   ├── DEPLOYMENT_WORKFLOW.md
│   ├── QUICK_DEPLOYMENT_GUIDE.md
│   ├── DEMO_DATA_SETUP.md
│   ├── SETUP_VERIFICATION.md
│   ├── NEW_USER_FLOW_TEST.md
│   └── MIGRATION_NEXT_STEPS.md
│
├── database/             # データベース関連
│   ├── DATABASE_SETUP.md       # データベースセットアップガイド（重要）
│   └── TABLE_STRUCTURE.md       # テーブル構造リファレンス
│
├── supabase/             # Supabase設定・設定関連
│   ├── REDIRECT_URL_SETUP.md
│   └── STORAGE_POLICY_CHECK.md
│
├── data/                 # データ管理・操作ガイド
│   ├── SAMPLE_DATA_MANAGEMENT.md    # サンプルデータ管理ガイド（重要）
│   ├── VERIFICATION_GUIDE.md
│   ├── CLEANUP_GUIDE.md
│   ├── DELETE_NEW_ALBUMS_GUIDE.md
│   ├── SAMPLE_ALBUM_IMAGE_SOURCE.md
│   └── PHOTO_STORAGE_MIGRATION.md
│
├── troubleshooting/      # トラブルシューティング
│   └── SQL_EDITOR_AUTH_ISSUE.md
│
└── issues/               # GitHub Issue関連
    ├── TEMPLATE.md       # GitHub Issueテンプレート
    ├── ISSUE_INDEX.md    # GitHub Issue 一覧・番号対応（main ブランチ移行後も番号維持）
    ├── BRANCH_MAIN_NOTE.md  # Issue・PR の main ブランチ対応（本番ブランチ main 前提）
    ├── STEP1_IMPLEMENTATION.md
    ├── ALBUM_CREATOR_IMPROVEMENT.md
    ├── DELETE_FEATURE.md
    └── *.txt             # Issue作成用ボディファイル
```

## 🎯 重要なドキュメント

### 新規参加者向け（必読）

#### [project/HANDOVER.md](project/HANDOVER.md)
**バイブコーディング作業引き継ぎテキスト**

プロジェクトの全体像を把握するための最重要ドキュメントです。

- プロジェクト概要と技術スタック
- 実装済み機能の詳細
- 重要な実装詳細（アルバム作成フロー、認証フローなど）
- データベース状態
- 開発フロー（Figma Make、Cursor、Supabase連携）
- 次のステップ

**初めて参加する開発者は、まずこのドキュメントを読むことを強く推奨します。**

#### [project/IMPLEMENTATION_STATUS.md](project/IMPLEMENTATION_STATUS.md)
**実装状況**

実装済み機能と未実装機能の詳細な一覧です。

- 実装済み機能の詳細
- 未実装機能のリスト
- 技術的負債
- 次の実装優先順位

開発を開始する前に、現在の実装状況を把握するために確認してください。

#### [project/DEVELOPMENT_GUIDE.md](project/DEVELOPMENT_GUIDE.md)
**開発ガイド**

Figma Make、Cursor、Supabaseを連携して実装を進めるための完全なガイドです。

- 開発環境セットアップ
- Figma Make連携の手順
- Cursorでの実装フロー
- Supabase連携の詳細
- 実装パターンとコード例
- デバッグ方法
- トラブルシューティング

### セットアップ関連

#### [setup/SETUP_GUIDE.md](setup/SETUP_GUIDE.md)
**セットアップガイド**

プロジェクトのセットアップ手順の詳細ガイドです。

- 環境変数の設定
- データベースのセットアップ
- 開発サーバーの起動
- トラブルシューティング

#### [database/DATABASE_SETUP.md](database/DATABASE_SETUP.md)
**データベースセットアップガイド**

Supabaseデータベースのセットアップ手順です。

- テーブル作成
- RLSポリシー設定
- Storageバケット設定
- 段階的セットアップ手順

### 開発・運用関連

#### [development/QUICK_FIX_GUIDE.md](development/QUICK_FIX_GUIDE.md)
**クイック修正ガイド**

よくあるエラーとその解決方法をまとめたガイドです。

- よくあるエラーの解決方法
- 段階的セットアップ手順
- トラブルシューティング

エラーが発生した際に最初に参照すべきドキュメントです。

#### [data/SAMPLE_DATA_MANAGEMENT.md](data/SAMPLE_DATA_MANAGEMENT.md)
**サンプルデータ管理ガイド**

サンプルアルバムのコピーや削除など、データ管理の手順です。

- サンプルアルバムのコピー
- 「新しいアルバム」の削除
- 重複アルバムの削除
- データ検証方法

## 🚀 クイックスタート

### 新規参加者向け

1. **プロジェクト概要を把握**
   - [project/HANDOVER.md](project/HANDOVER.md) を読む
   - [project/IMPLEMENTATION_STATUS.md](project/IMPLEMENTATION_STATUS.md) で実装状況を確認

2. **開発環境をセットアップ**
   - [setup/SETUP_GUIDE.md](setup/SETUP_GUIDE.md) に従ってセットアップ
   - 問題が発生したら [development/QUICK_FIX_GUIDE.md](development/QUICK_FIX_GUIDE.md) を参照

3. **開発を開始**
   - [project/DEVELOPMENT_GUIDE.md](project/DEVELOPMENT_GUIDE.md) で開発フローを確認
   - Figma Makeとの連携方法を理解

### よくあるタスク

| タスク | 参照ドキュメント |
|--------|----------------|
| データベースをセットアップする | [database/DATABASE_SETUP.md](database/DATABASE_SETUP.md) |
| サンプルデータを投入する | [data/SAMPLE_DATA_MANAGEMENT.md](data/SAMPLE_DATA_MANAGEMENT.md) |
| エラーが発生した | [development/QUICK_FIX_GUIDE.md](development/QUICK_FIX_GUIDE.md) |
| Supabaseの設定を確認する | [supabase/](supabase/) ディレクトリ |
| データを検証する | [data/VERIFICATION_GUIDE.md](data/VERIFICATION_GUIDE.md) |
| アルバム作成の問題を確認する | [project/ALBUM_CREATION_ISSUES.md](project/ALBUM_CREATION_ISSUES.md) |

## 📌 各ディレクトリの役割

### `project/`
プロジェクトの概要、実装状況、開発ガイド、引き継ぎ情報を格納。新規参加者が最初に読むべきドキュメントが含まれます。

### `setup/`
プロジェクトのセットアップ手順を格納。初回セットアップや環境構築時に参照します。

### `development/`
開発・検証・デプロイメント関連のドキュメントを格納。開発中のトラブルシューティングやデプロイ手順が含まれます。

### `database/`
データベース関連のドキュメントを格納。テーブル構造やセットアップ手順が含まれます。

### `supabase/`
Supabaseの設定・設定関連のドキュメントを格納。リダイレクトURL設定やStorageポリシーなどが含まれます。

### `data/`
データ管理・操作ガイドを格納。サンプルデータの投入、データ検証、クリーンアップなどの手順が含まれます。

### `troubleshooting/`
トラブルシューティング関連のドキュメントを格納。特定の問題に対する解決方法が含まれます。

### `issues/`
GitHub Issueのテンプレートや実装記録を格納。Issue作成時のテンプレートや過去の実装詳細が含まれます。

## 📌 重要な注意事項

- **開発者向けドキュメント**: このディレクトリのドキュメントは開発者向けです
- **`.cursorrules`**: プロジェクトルートの`.cursorrules`も併せて確認してください
- **最新情報**: ドキュメントは定期的に更新されます。実装状況と整合性を取るよう注意してください
- **ファイル追加**: 新しいドキュメントを追加する際は、適切なカテゴリディレクトリに配置してください

## 🔗 関連リンク

- **プロジェクトルートREADME**: [../README.md](../README.md) - 公開向けのREADME
- **Figmaデザイン**: https://www.figma.com/design/lPbJ0bzsWg0JfjucWuuoXu/Mantra-Photo-Album
- **Supabaseダッシュボード**: https://supabase.com/dashboard

---

**最終更新**: 2026年01月
