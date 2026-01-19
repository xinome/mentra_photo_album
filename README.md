# Mentra Photo Album

思い出を大切な人と共有するフォトアルバムアプリケーション

[![Next.js](https://img.shields.io/badge/Next.js-13-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8)](https://tailwindcss.com/)

## 🌟 主な機能

- ✨ **Magic Link認証**: パスワード不要の簡単ログイン
- 📊 **ダッシュボード**: 統計情報と最近のアルバムを一覧表示
- 📸 **アルバム管理**: 写真を整理して美しく表示
  - アルバム作成・編集・削除
  - 写真アップロード・削除・キャプション編集
- 🔗 **共有機能**: リンクで簡単にアルバムを共有
- 💾 **ストレージ管理**: ストレージ使用量の確認と管理
- 👤 **プロフィール設定**: ユーザー情報のカスタマイズ
- 🎨 **モダンUI**: shadcn/uiを使用した美しいデザイン
- 📱 **レスポンシブ**: モバイル・タブレット・デスクトップ対応

## 📋 必要要件

- **Node.js**: v18.18.0 以上（推奨: v20以上）
- **npm**: v8以上
- **Supabase**: リモートプロジェクト

⚠️ **重要**: 現在Node.js v16では動作しません。v18以上にアップグレードしてください。

## 🚀 クイックスタート

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd mentra_photo_album
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. 環境変数を設定

`.env.local.example`をコピーして`.env.local`を作成：

```bash
cp .env.local.example .env.local
```

`.env.local`を編集して、SupabaseのプロジェクトURLとAPIキーを設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**APIキーの取得方法**:
1. [Supabase Dashboard](https://supabase.com/dashboard)でプロジェクトを開く
2. Settings > API から`Project URL`と`anon public`キーをコピー

**⚠️ 重要: Magic Link認証のリダイレクトURL設定**

Vercelにデプロイする場合は、Supabaseダッシュボードで以下を設定してください：

1. Supabase Dashboard > **Authentication** > **URL Configuration**を開く
2. **Site URL** を設定: `https://mentra-photo-album.vercel.app`
3. **Redirect URLs** に以下を追加:
   - `https://mentra-photo-album.vercel.app/dashboard` (本番環境)
   - `http://localhost:3000/dashboard` (ローカル開発)

これにより、Magic Linkからの認証後にダッシュボードへ正しくリダイレクトされます。

### 4. データベースをセットアップ

**重要**: この手順を実行しないとアプリケーションが正しく動作しません。

#### 推奨方法: 段階的セットアップ（エラーが出にくい）

1. Supabaseダッシュボード > **SQL Editor**を開く
2. **ステップ1**: テーブル作成
   - **New Query**をクリック
   - `supabase/sql/01-tables-only.sql`の内容をコピー&ペースト
   - **Run**をクリック
3. **ステップ2**: RLSポリシー設定
   - 新しいクエリを開く
   - `supabase/sql/02-rls-policies.sql`の内容をコピー&ペースト
   - **Run**をクリック
4. **ステップ3**: ストレージバケット（手動推奨）
   - Storage > Create a new bucket > Name: `photos`

#### 代替方法: 手動セットアップ

SQLエラーが解決しない場合は [手動セットアップガイド](docs/setup/MANUAL_SETUP_GUIDE.md) を参照してください。

詳細は [データベースセットアップガイド](docs/database/DATABASE_SETUP.md) を参照してください。

#### サンプルデータの投入（オプション）

デモ用に、アルバムと写真のサンプルデータを投入できます：

1. Supabaseダッシュボード > **SQL Editor**を開く
2. `supabase/sql/sample-data.sql`の内容をコピー&ペースト
3. **Run**をクリック

これにより以下が作成されます：
- 4つのアルバム（家族旅行、結婚式、サッカー部合宿、卒業式）
- 各アルバムに6-8枚のサンプル写真（Unsplashから）

⚠️ **注意**: このサンプルデータは開発環境でのテスト用です。本番環境では実行しないでください。

### 5. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 📚 ドキュメント

### セットアップ関連
- [セットアップガイド](docs/setup/SETUP_GUIDE.md) - 詳細なセットアップ手順
- [手動セットアップガイド](docs/setup/MANUAL_SETUP_GUIDE.md) - 確実な手動セットアップ
- [セットアップ方法まとめ](docs/setup/SETUP_SUMMARY.md) - セットアップ方法の比較

### データベース関連
- [データベースセットアップ](docs/database/DATABASE_SETUP.md) - データベース設定の詳細
- [テーブル構造](docs/database/TABLE_STRUCTURE.md) - データベーステーブル仕様

### 開発関連
- [開発ガイド](docs/project/DEVELOPMENT_GUIDE.md) - Figma Make、Cursor、Supabase連携ガイド
- [実装状況](docs/project/IMPLEMENTATION_STATUS.md) - 実装済み機能と未実装機能の一覧
- [新規ユーザーフローテスト](docs/development/NEW_USER_FLOW_TEST.md) - 新規ユーザー登録フローの検証方法
- [本番移行の次のステップ](docs/development/MIGRATION_NEXT_STEPS.md) - 今後の開発計画
- [デモデータセットアップ](docs/development/DEMO_DATA_SETUP.md) - デモ環境の構築
- [クイック修正ガイド](docs/development/QUICK_FIX_GUIDE.md) - よくあるエラーの解決方法

## 🎨 デザイン

このプロジェクトのデザインは[Figma](https://www.figma.com/design/lPbJ0bzsWg0JfjucWuuoXu/Mantra-Photo-Album?node-id=0-1&t=7ioFSvQtABZ1m2Jx-1)で管理されています。

## 🏗️ プロジェクト構成

```
mentra_photo_album/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/login/      # ログインページ
│   │   ├── dashboard/         # ダッシュボード（統計情報と最近のアルバム）
│   │   ├── albums/            # アルバム一覧・詳細
│   │   │   ├── create/        # アルバム作成
│   │   │   └── [id]/          # アルバム詳細
│   │   │       └── edit/      # アルバム編集
│   │   ├── account/           # アカウント設定
│   │   ├── share/             # 共有アルバム
│   │   │   └── [token]/       # 共有アルバム表示
│   │   ├── storage/           # ストレージ管理
│   │   └── auth/callback/     # 認証コールバック
│   ├── components/            # Reactコンポーネント
│   │   ├── ui/                # shadcn/ui コンポーネント
│   │   └── figma/             # Figma生成コンポーネント
│   ├── lib/                   # ユーティリティ
│   └── types/                 # TypeScript型定義
├── supabase/
│   ├── config.toml            # Supabase設定
│   ├── sql/                   # SQLスクリプト
│   └── functions/             # Edge Functions
└── docs/
    ├── setup/                 # セットアップ関連ドキュメント
    ├── database/              # データベース関連ドキュメント
    └── development/           # 開発・検証関連ドキュメント
```

## 🔧 トラブルシューティング

### プロフィール保存エラー

**エラー**: 「プロフィールの保存に失敗しました」

**解決方法**: [データベースセットアップガイド](docs/database/DATABASE_SETUP.md)を参照してデータベーステーブルを作成してください。

### Node.jsバージョンエラー

**エラー**: `You are using Node.js 16.x.x. For Next.js, Node.js version "^18.18.0 || >= 20.0.0" is required.`

**解決方法**: Node.jsをv18以上にアップグレードしてください。

```bash
# nvmを使用している場合
nvm install 20
nvm use 20
```

### Magic Link送信エラー

**エラー**: `ERR_NAME_NOT_RESOLVED`

**解決方法**:
1. `.env.local`が存在し、正しい値が設定されているか確認
2. 開発サーバーを再起動
3. Supabaseダッシュボードでメール認証が有効になっているか確認

詳細は[セットアップガイド](docs/setup/SETUP_GUIDE.md#トラブルシューティング)を参照してください。

## 🛠️ 技術スタック

- **フレームワーク**: [Next.js 13](https://nextjs.org/) (App Router)
- **認証・データベース**: [Supabase](https://supabase.com/)
- **UI**: [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **言語**: [TypeScript](https://www.typescriptlang.org/)
- **アイコン**: [Lucide React](https://lucide.dev/)

## 📝 開発状況

詳細は [実装状況ドキュメント](docs/project/IMPLEMENTATION_STATUS.md) を参照してください。

### ✅ 実装済み

#### 認証機能
- Magic Link認証
- ログイン・ログアウト
- 認証コールバック処理

#### プロフィール機能
- プロフィール設定（新規ユーザー）
- プロフィール表示
- アカウント管理

#### アルバム機能
- ダッシュボード（統計情報と最近のアルバム表示）
- アルバム一覧・作成
- アルバム詳細表示
- **アルバム編集**（タイトル・説明・カテゴリ・アイキャッチ画像・公開設定）
- **アルバム削除**（作成者本人のみ）
- 写真アップロード（複数選択対応）
- **写真削除**（投稿者本人のみ）
- **写真キャプション編集**
- エラーハンドリング

#### ストレージ管理
- ストレージ使用量の確認
- アルバム別ストレージ使用量の表示
- 不要ファイルのクリーンアップ

#### 共有機能
- 共有アルバム表示（`/share/[token]`）

#### UI/UX
- レスポンシブデザイン
- ローディング状態
- エラーメッセージ表示

### 🔄 開発ガイド

- [開発ガイド](docs/project/DEVELOPMENT_GUIDE.md) - Figma Make、Cursor、Supabase連携ガイド
- [実装状況](docs/project/IMPLEMENTATION_STATUS.md) - 実装済み機能と未実装機能の一覧

### 🚧 開発中・未実装

- 画像アップロードUI改善（ドラッグ&ドロップ）
- いいね機能
- コメント機能
- プロフィール編集（既存ユーザー向け）
- アルバムダウンロード機能
- 共有リンク生成（UI完全実装）
- アルバムメンバー招待

## 🤝 コントリビューション

プルリクエストは歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🔗 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
