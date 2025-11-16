# GitHub Issue自動化スクリプト

このディレクトリには、GitHub Issuesの作成とクローズを自動化するスクリプトが含まれています。

## 📋 前提条件

### 必要なツール

1. **GitHub CLI (`gh`)**
   ```bash
   # macOS
   brew install gh
   
   # 認証
   gh auth login
   ```

2. **jq** (Issue作成時に必要)
   ```bash
   # macOS
   brew install jq
   ```

## 🚀 使い方

### 1. Issueを作成する

フェーズ別のIssueを作成します。

```bash
# Phase 1のIssueを作成
./scripts/create-phase-issue.sh 1

# Phase 2のIssueを作成
./scripts/create-phase-issue.sh 2

# Phase 3のIssueを作成
./scripts/create-phase-issue.sh 3

# Phase 4のIssueを作成
./scripts/create-phase-issue.sh 4

# カスタムタイトルでIssueを作成（Phase 2のテンプレートを使用）
./scripts/create-phase-issue.sh 2 "カスタムタイトル"
```

**出力例**:
```
✅ Issue作成完了！
Issue番号: #123
URL: https://github.com/xinome/mentra_photo_album/issues/123

コミットメッセージに含めるIssue番号:
Closes #123
```

### 2. Issueをクローズする

実装とテストが完了したIssueをクローズします。

```bash
# Issue番号を指定してクローズ（デフォルトコメント付き）
./scripts/close-issue.sh 123

# カスタムコメント付きでクローズ
./scripts/close-issue.sh 123 "実装とテストが完了しました。Phase 1完了！"
```

**出力例**:
```
以下のIssueをクローズします:
Issue番号: #123
タイトル: 📝 [実装ログ] Phase 1: Magic Link認証のエラーハンドリング実装
コメント: ✅ 実装とテストが完了しました。

続行しますか？ (y/N): y
✅ Issue #123 をクローズしました
URL: https://github.com/xinome/mentra_photo_album/issues/123
```

## 📝 Phase別のテンプレート

各Phaseには以下のテンプレートが用意されています:

- **Phase 1**: エラーハンドリング実装ログ
- **Phase 2**: ログイン後のプロフィールチェックと遷移ロジック
- **Phase 3**: 認証コールバック専用ページの作成
- **Phase 4**: その他の改善

## 🔧 トラブルシューティング

### GitHub CLIが認証されていない場合

```bash
gh auth login
```

### jqがインストールされていない場合

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Fedora
sudo dnf install jq
```

### スクリプトが実行できない場合

```bash
chmod +x scripts/create-phase-issue.sh
chmod +x scripts/close-issue.sh
```

### Issueが見つからない場合

```bash
# リポジトリの確認
gh repo view

# Issueリストの確認
gh issue list
```

## 📚 関連ドキュメント

- [実装ログ](../../docs/issues/IMPLEMENTATION_LOG.md)
- [GitHub CLI公式ドキュメント](https://cli.github.com/manual/)

