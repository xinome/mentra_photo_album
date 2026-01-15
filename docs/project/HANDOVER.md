# バイブコーディング作業引き継ぎテキスト

## プロジェクト概要

**Mentra Photo Album** - 思い出を大切な人と共有するフォトアルバムアプリケーション

- **技術スタック**: Next.js 14 (App Router) + Supabase + TypeScript + Tailwind CSS
- **デザイン**: Figma (Figma Makeでコンポーネント生成)
- **開発ツール**: Cursor (AI支援開発)
- **データベース**: Supabase (PostgreSQL + Storage)

## 重要な設定ファイル

### 1. `.cursorrules`
プロジェクトルートに配置。Cursorが自動的に読み込むプロジェクト設定ファイル。
- コーディング規約
- プロジェクト構造
- 実装済み機能
- 開発フロー

### 2. `docs/project/DEVELOPMENT_GUIDE.md`
完全な開発ガイド。Figma Make、Cursor、Supabase連携の手順を記載。

### 3. `docs/project/IMPLEMENTATION_STATUS.md`
実装状況の詳細。実装済み機能と未実装機能の一覧。

## プロジェクト構造

```
mentra_photo_album/
├── .cursorrules              # Cursor設定ファイル（重要！）
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/login/     # ログインページ
│   │   ├── albums/           # アルバム一覧・詳細（主要機能）
│   │   │   ├── page.tsx      # アルバム一覧ページ（実装済み）
│   │   │   └── [id]/         # アルバム詳細ページ
│   │   ├── account/          # アカウント設定
│   │   ├── share/            # 共有アルバム（未実装）
│   │   └── auth/callback/    # 認証コールバック
│   ├── components/           # Reactコンポーネント
│   │   ├── ui/               # shadcn/ui コンポーネント
│   │   ├── figma/            # Figma Make生成コンポーネント
│   │   ├── Dashboard.tsx     # アルバム一覧表示
│   │   ├── AlbumCreator.tsx  # アルバム作成フォーム
│   │   ├── AlbumViewer.tsx   # アルバム詳細表示
│   │   ├── AuthGuard.tsx     # 認証ガード
│   │   └── AuthProvider.tsx  # 認証状態管理
│   ├── lib/                  # ユーティリティ
│   │   ├── supabase.ts       # Supabaseクライアント
│   │   ├── supabase-server.ts # サーバーサイドSupabase
│   │   ├── config.ts         # 設定（リダイレクトURL等）
│   │   └── auth-errors.ts     # 認証エラーハンドリング
│   └── types/
│       └── supabase.ts       # Supabase型定義（自動生成）
├── supabase/
│   └── sql/                  # SQLスクリプト
│       ├── 01-tables-only.sql      # テーブル作成
│       ├── 02-rls-policies.sql     # RLSポリシー
│       ├── 03-storage.sql          # Storage設定
│       ├── copy-sample-albums.sql   # サンプルデータ作成
│       └── cleanup-duplicate-albums.sql # 重複削除
└── docs/
    ├── project/
    │   ├── DEVELOPMENT_GUIDE.md   # 開発ガイド（重要！）
    │   ├── IMPLEMENTATION_STATUS.md # 実装状況（重要！）
    │   └── HANDOVER.md            # このファイル
    └── ...                    # その他のドキュメント
```

## 実装済み機能（重要）

### ✅ 認証機能
- Magic Link認証（完全実装）
- 認証状態管理（`AuthProvider`）
- 認証ガード（`AuthGuard`）
- エラーハンドリング（`lib/auth-errors.ts`）

### ✅ プロフィール機能
- プロフィール設定（新規ユーザー）
- プロフィール表示

### ✅ アルバム機能（主要機能）
- **アルバム一覧表示** (`src/app/albums/page.tsx`)
  - ダッシュボード表示
  - 6件表示 + すべて表示ボタン
  - 写真数の表示
- **アルバム作成** (`src/components/AlbumCreator.tsx`)
  - タイトル、説明入力
  - カテゴリ選択（実装済み）
  - 公開設定（トグル）
  - 写真アップロード（複数選択）
  - ファイル名サニタイズ（日本語対応）
  - Supabase Storageへのアップロード
  - データベースへの保存
- **アルバム詳細表示** (`src/app/albums/[id]/page.tsx`)
  - アルバム情報表示
  - 写真一覧表示
  - Unsplash URL / Supabase Storage対応
  - 写真削除機能（投稿者本人のみ）
  - 写真キャプション編集機能
- **アルバム編集** (`src/app/albums/[id]/edit/page.tsx`, `src/components/AlbumEditor.tsx`)
  - タイトル・説明・カテゴリの編集
  - アイキャッチ画像の変更・削除
  - 公開設定の変更
- **アルバム削除** (`src/app/albums/[id]/page.tsx`)
  - 作成者本人のみ削除可能
  - ストレージからの写真削除も含む

### ✅ データベース
- テーブル構造（`profiles`, `albums`, `photos`）
- RLS (Row Level Security) 設定済み
- Storage (`photos`バケット) 設定済み

## 未実装機能（次の実装候補）

### ❌ アルバム機能
- ✅ アルバム編集（実装済み）
- ✅ アルバム削除（UI）（実装済み）
- ✅ 写真削除（実装済み）
- ✅ 写真編集（キャプション等）（実装済み）

### ❌ 共有機能
- 共有リンク生成
- 共有アルバム表示
- 共有リンク管理

### ❌ その他
- 検索機能
- フィルター機能
- ソート機能

## 重要な実装詳細

### アルバム作成フロー
1. `src/app/albums/page.tsx`の`handleCreateAlbum`で状態を`"creating"`に変更
2. `AlbumCreator`コンポーネントを表示
3. `handleSaveAlbum`で以下を実行：
   - 写真をSupabase Storageにアップロード（ファイル名サニタイズ済み）
   - アルバムを`albums`テーブルに保存
   - 写真メタデータを`photos`テーブルに保存
   - アルバム一覧を再取得
   - アルバム詳細ページにリダイレクト

### ファイル名サニタイズ
日本語文字を含むファイル名をSupabase Storage用にサニタイズ：
```typescript
const sanitizedName = fileName
  .replace(/[^a-zA-Z0-9_-]/g, '_')
  .substring(0, 50);
```

### 認証フロー
1. `MagicLinkLogin`でメールアドレス入力
2. SupabaseにMagic Link送信
3. メール内のリンクをクリック
4. `app/auth/callback/page.tsx`で認証処理
5. 新規ユーザーの場合はプロフィール設定画面へ

## データベース状態

### テーブル
- ✅ `profiles` - 正常動作
- ✅ `albums` - 正常動作
- ✅ `photos` - 正常動作（Unsplash URL / Supabase Storage対応）

### Storage
- ✅ `photos`バケット作成済み
- ✅ RLSポリシー設定済み
- ⚠️ サンプルデータはUnsplash URLを使用（Storageには保存されていない）

### サンプルデータ
- サンプルアルバム作成スクリプト: `supabase/sql/copy-sample-albums.sql`
- 重複削除スクリプト: `supabase/sql/cleanup-duplicate-albums.sql`
- データ検証スクリプト: `supabase/sql/verify-data.sql`

## 開発環境セットアップ

### 1. 環境変数
`.env.local`ファイルを作成：
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. Supabase型定義の生成
```bash
npm run supabase:types
```

### 4. 開発サーバー起動
```bash
npm run dev
```

## 開発フロー（バイブコーディング）

### 1. Figma Make連携
1. Figmaデザインを確認
2. Figma Makeでコンポーネントを生成
3. `src/components/figma/`に配置
4. shadcn/uiコンポーネントと統合

### 2. Cursorでの実装
1. `.cursorrules`を確認（自動読み込み）
2. `docs/project/DEVELOPMENT_GUIDE.md`を参照
3. 実装パターンを参照
4. 実装を開始

### 3. Supabase連携
1. データベース変更時は`supabase/sql/`にSQLスクリプトを作成
2. Supabaseダッシュボード > SQL Editorで実行
3. 型定義を再生成: `npm run supabase:types`

## 最近の作業内容

### 完了した作業
1. ✅ アルバム作成フローの実装
   - `AlbumCreator`コンポーネントの統合
   - Supabase Storageへの写真アップロード
   - ファイル名サニタイズ（日本語対応）

2. ✅ アルバム一覧の写真数表示
   - データベースから実際の写真数を取得
   - アルバムカードに表示

3. ✅ 重複アルバムの削除
   - SQLスクリプト作成
   - データクリーンアップ完了

4. ✅ 設定ファイルの作成
   - `.cursorrules` - Cursor設定
   - `docs/DEVELOPMENT_GUIDE.md` - 開発ガイド
   - `docs/IMPLEMENTATION_STATUS.md` - 実装状況

### 現在の状態
- アルバム作成機能は正常に動作
- アルバム編集機能が実装済み
- アルバム削除機能が実装済み
- 写真削除・キャプション編集機能が実装済み
- 写真アップロードはSupabase Storageに保存される
- アルバム一覧は正常に表示される
- 重複アルバムは削除済み

## 次のステップ（推奨）

1. **共有機能**
   - 共有リンク生成
   - 共有アルバム表示

2. **パフォーマンス改善**
   - 画像の遅延読み込み
   - クエリの最適化

3. **セキュリティ強化**
   - ファイルサイズ制限
   - レート制限

## トラブルシューティング

### よくあるエラー
1. **認証エラー**
   - `.env.local`が正しく設定されているか確認
   - SupabaseダッシュボードでリダイレクトURLを確認

2. **データベースエラー**
   - RLSポリシーを確認
   - SQL Editorで直接クエリを実行

3. **ビルドエラー**
   - 型定義を再生成: `npm run supabase:types`
   - 依存関係を再インストール: `npm install`

## 参考ドキュメント

- **開発ガイド**: `docs/project/DEVELOPMENT_GUIDE.md`
- **実装状況**: `docs/project/IMPLEMENTATION_STATUS.md`
- **セットアップガイド**: `docs/setup/SETUP_GUIDE.md`
- **データベース構造**: `docs/database/TABLE_STRUCTURE.md`
- **サンプルデータ管理**: `docs/data/SAMPLE_DATA_MANAGEMENT.md`

## 重要な注意事項

1. **`.cursorrules`を必ず確認**
   - Cursorが自動的に読み込む
   - プロジェクトのコンテキストを理解するために重要

2. **型安全性を最優先**
   - `any`型の使用は避ける
   - Supabase型を活用: `src/types/supabase.ts`

3. **エラーハンドリング**
   - すべての非同期処理にtry-catchを実装
   - ユーザーフレンドリーなエラーメッセージを表示

4. **ファイル名サニタイズ**
   - 日本語文字を含むファイル名は必ずサニタイズ
   - Supabase Storageは非ASCII文字を直接受け付けない

5. **RLSポリシー**
   - すべてのテーブルにRLSを有効化
   - 適切なポリシーを設定

## 連絡先・リソース

- **Figmaデザイン**: https://www.figma.com/design/lPbJ0bzsWg0JfjucWuuoXu/Mantra-Photo-Album
- **Supabaseダッシュボード**: https://supabase.com/dashboard
- **プロジェクトルート**: `/Users/ikomasatoru/Desktop/workspace/個人開発プロジェクト/mentra_photo_album`

---

**このドキュメントは、新しいチャットセッションでプロジェクトのコンテキストを理解するために使用してください。**

