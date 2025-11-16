#!/bin/bash

# Phase別のIssue作成スクリプト
# 使用方法: ./scripts/create-phase-issue.sh <phase_number> [title]
# 例: ./scripts/create-phase-issue.sh 2
# 例: ./scripts/create-phase-issue.sh 2 "カスタムタイトル"

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# エラー処理
error_exit() {
    echo -e "${RED}エラー: $1${NC}" >&2
    exit 1
}

# 引数チェック
PHASE_NUM=$1
CUSTOM_TITLE=$2

if [ -z "$PHASE_NUM" ]; then
    error_exit "フェーズ番号を指定してください。\n使用方法: ./scripts/create-phase-issue.sh <phase_number> [title]"
fi

# GitHub CLIがインストールされているか確認
if ! command -v gh &> /dev/null; then
    error_exit "GitHub CLI (gh) がインストールされていません。\nインストール方法: brew install gh"
fi

# GitHub認証確認
if ! gh auth status &> /dev/null; then
    error_exit "GitHub CLI が認証されていません。\n認証方法: gh auth login"
fi

# Phase別のテンプレート
case $PHASE_NUM in
    1)
        TITLE="📝 [実装ログ] Phase 1: Magic Link認証のエラーハンドリング実装"
        LABELS="documentation,enhancement,phase-1"
        BODY="## ✅ Phase 1: エラーハンドリング実装ログ

### 実装内容

#### 1. エラーメッセージユーティリティ関数の作成
- **ファイル**: \`src/lib/auth-errors.ts\` (新規)
- Supabase Authエラーを日本語メッセージに変換

#### 2. ログインページのエラーハンドリング強化
- **ファイル**: \`src/app/(auth)/login/page.tsx\`
- Magic Link送信時・再送信時のエラーハンドリング追加

#### 3. UIコンポーネントのエラー表示機能
- \`MagicLinkLogin.tsx\` - エラーメッセージ表示UI追加
- \`MagicLinkSent.tsx\` - 再送信エラー表示機能追加

## 📁 変更ファイル一覧

- [ ] \`src/lib/auth-errors.ts\` (新規作成)
- [ ] \`src/app/(auth)/login/page.tsx\` (修正)
- [ ] \`src/components/MagicLinkLogin.tsx\` (修正)
- [ ] \`src/components/MagicLinkSent.tsx\` (修正)

## ✅ テスト状況

- [ ] エラーメッセージが正しく表示される
- [ ] メールアドレス形式エラー時の動作確認
- [ ] レート制限エラー時の動作確認
- [ ] ネットワークエラー時の動作確認
- [ ] 再送信エラーの表示確認
- [ ] アクセシビリティ対応確認（aria-invalid等）

## 📚 参考資料

- [CURSOR_HANDOFF.md](../CURSOR_HANDOFF.md)
- [SUPABASE_IMPLEMENTATION_GUIDE.md](../SUPABASE_IMPLEMENTATION_GUIDE.md)

## 🔗 関連

- Phase 2: （実装後にリンクを追加）"
        ;;
    2)
        TITLE="📝 [実装] Phase 2: ログイン後のプロフィールチェックと遷移ロジック"
        LABELS="enhancement,phase-2"
        BODY="## 📋 Phase 2: ログイン後のプロフィールチェックと遷移ロジック

### 実装予定内容

#### 1. 認証成功後のプロフィールチェックと遷移
- ログイン後のプロフィール存在確認
- プロフィール未設定時は \`/account/setup\` へリダイレクト
- プロフィール設定済み時は \`/albums\` へリダイレクト

#### 2. \`albums/page.tsx\` のプロフィールチェックを任意にする
- 強制リダイレクトを削除
- プロフィール未設定時は警告バナー表示（任意設定への案内）

## 📁 変更予定ファイル

- [ ] \`src/components/AuthProvider.tsx\` - セッション管理の拡張
- [ ] \`src/app/albums/page.tsx\` - プロフィールチェックロジックの変更
- [ ] \`src/app/auth/callback/page.tsx\` (新規作成) - 認証コールバック専用ページ（推奨）

## ✅ 実装チェックリスト

- [ ] 認証成功後のプロフィールチェック実装
- [ ] プロフィール未設定時の \`/account/setup\` 遷移実装
- [ ] プロフィール設定済み時の \`/albums\` 遷移実装
- [ ] \`albums/page.tsx\` の強制リダイレクト削除
- [ ] プロフィール未設定時の警告バナー実装

## 📚 参考資料

- [SUPABASE_IMPLEMENTATION_GUIDE.md](../SUPABASE_IMPLEMENTATION_GUIDE.md)
- Phase 1: #XX (完了後にIssue番号を追加)

## 🔗 次のステップ

- Phase 3: 認証コールバック専用ページの作成"
        ;;
    3)
        TITLE="📝 [実装] Phase 3: 認証コールバック専用ページの作成"
        LABELS="enhancement,phase-3"
        BODY="## 📋 Phase 3: 認証コールバック専用ページの作成

### 実装予定内容

#### \`src/app/auth/callback/page.tsx\` の作成
- URLハッシュからの認証情報処理
- セッション設定
- プロフィールチェックと遷移ロジック

### 実装理由

- ドキュメント仕様と一致
- 役割が明確
- テストしやすい

## 📁 変更予定ファイル

- [ ] \`src/app/auth/callback/page.tsx\` (新規作成)
- [ ] \`src/components/AuthProvider.tsx\` - コールバック処理の調整（必要に応じて）

## ✅ 実装チェックリスト

- [ ] 認証コールバックページの作成
- [ ] URLハッシュからの認証情報処理実装
- [ ] セッション設定実装
- [ ] プロフィールチェックと遷移ロジック実装
- [ ] エラーハンドリング実装

## 📚 参考資料

- [SUPABASE_IMPLEMENTATION_GUIDE.md](../SUPABASE_IMPLEMENTATION_GUIDE.md)
- Phase 2: #XX (完了後にIssue番号を追加)

## 🔗 次のステップ

- Phase 4: その他の改善"
        ;;
    4)
        TITLE="📝 [実装] Phase 4: その他の改善"
        LABELS="enhancement,phase-4"
        BODY="## 📋 Phase 4: その他の改善

### 実装予定内容

- [ ] ログアウト機能の確認
- [ ] セッション更新時の処理確認
- [ ] エラー時の適切なリダイレクト

## 📁 変更予定ファイル

- [ ] \`src/components/Header.tsx\` - ログアウト処理の確認
- [ ] \`src/components/AuthProvider.tsx\` - セッション更新時の処理確認

## ✅ 実装チェックリスト

- [ ] ログアウト機能の動作確認
- [ ] セッション更新時の処理確認
- [ ] エラー時の適切なリダイレクト実装
- [ ] 全体的な動作確認

## 📚 参考資料

- Phase 3: #XX (完了後にIssue番号を追加)"
        ;;
    *)
        error_exit "不明なフェーズ番号: $PHASE_NUM\n有効な値: 1, 2, 3, 4"
        ;;
esac

# カスタムタイトルが指定されている場合は上書き
if [ -n "$CUSTOM_TITLE" ]; then
    TITLE="$CUSTOM_TITLE"
fi

# Issue作成
echo -e "${BLUE}Issueを作成中...${NC}"
echo -e "${YELLOW}タイトル: $TITLE${NC}"
echo -e "${YELLOW}ラベル: $LABELS${NC}"
echo ""

# ラベルが存在するか確認して、存在しない場合はスキップ
VALID_LABELS=""
IFS=',' read -ra LABEL_ARRAY <<< "$LABELS"
for label in "${LABEL_ARRAY[@]}"; do
    label=$(echo "$label" | xargs)  # トリム
    if gh label view "$label" &> /dev/null; then
        if [ -z "$VALID_LABELS" ]; then
            VALID_LABELS="$label"
        else
            VALID_LABELS="$VALID_LABELS,$label"
        fi
    else
        echo -e "${YELLOW}⚠️  ラベル '$label' が存在しないためスキップします${NC}"
    fi
done

# GitHub CLIでIssue作成
# 出力例: "https://github.com/xinome/mentra_photo_album/issues/123"
if [ -n "$VALID_LABELS" ]; then
    ISSUE_URL=$(gh issue create \
        --title "$TITLE" \
        --label "$VALID_LABELS" \
        --body "$BODY" 2>&1)
else
    ISSUE_URL=$(gh issue create \
        --title "$TITLE" \
        --body "$BODY" 2>&1)
fi

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ] && [ -n "$ISSUE_URL" ]; then
    # URLからIssue番号を抽出
    # 例: https://github.com/xinome/mentra_photo_album/issues/123 → 123
    ISSUE_NUMBER=$(echo "$ISSUE_URL" | grep -oE '[0-9]+$')
    
    if [ -n "$ISSUE_NUMBER" ]; then
        echo -e "${GREEN}✅ Issue作成完了！${NC}"
        echo -e "${GREEN}Issue番号: #$ISSUE_NUMBER${NC}"
        echo -e "${GREEN}URL: $ISSUE_URL${NC}"
        echo ""
        echo -e "${BLUE}コミットメッセージに含めるIssue番号:${NC}"
        echo -e "${YELLOW}Closes #$ISSUE_NUMBER${NC}"
    else
        error_exit "Issue番号の抽出に失敗しました\n出力: $ISSUE_URL"
    fi
else
    error_exit "Issueの作成に失敗しました\n終了コード: $EXIT_CODE\n出力: $ISSUE_URL"
fi

