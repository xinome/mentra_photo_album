# Zenn 連携の状態（本リポジトリ）

GitHub と Zenn の連携は**本リポジトリ（mentra_photo_album）のみ**設定済みです。

## 1. 現在のリポジトリの状態

### ディレクトリ構成

```
mentra_photo_album/
├── articles/                    # Zenn 記事用（ルート直下）
│   └── mentra-photo-album-zenn-test.md   # テスト用記事
├── books/                       # Zenn 本用（空）
├── docs/
│   └── note/
│       └── ZENN_SETUP.md        # 本ドキュメント
└── ...
```

### 設定内容

| 項目 | 状態 |
|------|------|
| Zenn 連携 | 本リポジトリのみ設定済み |
| `articles/` | あり（テスト記事 1 本） |
| `books/` | あり（空） |
| Zenn CLI | 未導入（`npx zenn init` は peer dependency の都合で未実行。ディレクトリは手動作成） |

### 注意

- Zenn が参照するのは**リポジトリルート直下**の `articles/` と `books/` のみです。
- `docs/note/` 以下にある `.md` は Zenn には取り込まれません。

## 2. テスト用記事

- **ファイル**: `articles/mentra-photo-album-zenn-test.md`
- **目的**: GitHub → Zenn の同期が動作するかの確認
- **公開**: `published: true` で公開設定

### 同期の確認方法

1. 上記記事をコミットし、Zenn に連携しているブランチ（通常は `main`）にプッシュする。
2. [Zenn ダッシュボード → デプロイ](https://zenn.dev/dashboard/deploys) でデプロイ履歴を確認する。
3. 成功していれば、Zenn の記事一覧に「Zenn連携テスト記事（mentra_photo_album）」が表示される。

## 参考

- [Zenn と GitHub リポジトリを連携する](https://zenn.dev/zenn/articles/connect-to-github)
- [Zenn CLI の導入手順](https://zenn.dev/zenn/articles/install-zenn-cli)
