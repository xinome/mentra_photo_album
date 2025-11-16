#!/bin/bash

# Issueをクローズするスクリプト
# 使用方法: ./scripts/close-issue.sh <issue_number> [comment]
# 例: ./scripts/close-issue.sh 1
# 例: ./scripts/close-issue.sh 1 "実装とテストが完了しました"

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
ISSUE_NUM=$1
COMMENT=$2

if [ -z "$ISSUE_NUM" ]; then
    error_exit "Issue番号を指定してください。\n使用方法: ./scripts/close-issue.sh <issue_number> [comment]"
fi

# GitHub CLIがインストールされているか確認
if ! command -v gh &> /dev/null; then
    error_exit "GitHub CLI (gh) がインストールされていません。\nインストール方法: brew install gh"
fi

# GitHub認証確認
if ! gh auth status &> /dev/null; then
    error_exit "GitHub CLI が認証されていません。\n認証方法: gh auth login"
fi

# Issueが存在するか確認
if ! gh issue view "$ISSUE_NUM" &> /dev/null; then
    error_exit "Issue #$ISSUE_NUM が見つかりません"
fi

# Issue情報を取得
ISSUE_TITLE=$(gh issue view "$ISSUE_NUM" --json title -q '.title')
ISSUE_STATE=$(gh issue view "$ISSUE_NUM" --json state -q '.state')

# 既にクローズされているか確認
if [ "$ISSUE_STATE" = "CLOSED" ]; then
    echo -e "${YELLOW}⚠️  Issue #$ISSUE_NUM は既にクローズされています${NC}"
    exit 0
fi

# デフォルトコメント
DEFAULT_COMMENT="✅ 実装とテストが完了しました。"

# コメントが指定されている場合は使用、なければデフォルト
CLOSE_COMMENT="${COMMENT:-$DEFAULT_COMMENT}"

# 確認メッセージ
echo -e "${BLUE}以下のIssueをクローズします:${NC}"
echo -e "${YELLOW}Issue番号: #$ISSUE_NUM${NC}"
echo -e "${YELLOW}タイトル: $ISSUE_TITLE${NC}"
echo -e "${YELLOW}コメント: $CLOSE_COMMENT${NC}"
echo ""

# 確認プロンプト（対話的でない場合はスキップ）
if [ -t 0 ]; then
    read -p "続行しますか？ (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}キャンセルされました${NC}"
        exit 0
    fi
fi

# Issueをクローズ
echo -e "${BLUE}Issueをクローズ中...${NC}"

if [ -n "$COMMENT" ]; then
    # カスタムコメント付きでクローズ
    gh issue close "$ISSUE_NUM" --comment "$CLOSE_COMMENT"
else
    # デフォルトコメント付きでクローズ
    gh issue close "$ISSUE_NUM" --comment "$DEFAULT_COMMENT"
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Issue #$ISSUE_NUM をクローズしました${NC}"
    echo -e "${GREEN}URL: https://github.com/xinome/mentra_photo_album/issues/$ISSUE_NUM${NC}"
else
    error_exit "Issueのクローズに失敗しました"
fi

