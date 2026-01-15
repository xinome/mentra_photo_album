# 開発ガイド

このドキュメントは、Mentra Photo Albumの開発を進めるための完全なガイドです。
Figma Make、Cursor、Supabaseを連携して実装を進めるための手順を説明します。

## 開発環境セットアップ

### 1. 前提条件
- Node.js v18.18.0以上（推奨: v20以上）
- npm v8以上
- Supabaseアカウント
- Figmaアカウント（Figma Make使用時）

### 2. リポジトリのクローン
```bash
git clone <repository-url>
cd mentra_photo_album
```

### 3. 依存関係のインストール
```bash
npm install
```

### 4. 環境変数の設定
`.env.local`ファイルを作成し、以下を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**APIキーの取得方法**:
1. [Supabase Dashboard](https://supabase.com/dashboard)でプロジェクトを開く
2. Settings > API から`Project URL`と`anon public`キーをコピー

### 5. Supabase型定義の生成
```bash
npm run supabase:types
```

これにより、`src/types/supabase.ts`が自動生成されます。

## 開発フロー

### Figma Make連携

#### 1. Figmaデザインの確認
- [Figmaデザイン](https://www.figma.com/design/lPbJ0bzsWg0JfjucWuuoXu/Mantra-Photo-Album)を確認
- 実装するコンポーネントを特定

#### 2. Figma Makeからの引き継ぎ方法

**推奨: 両方のURLを共有（最優先はプレビューサイトURL）**

##### 優先順位
1. **公開したプレビューサイトのURL**（最優先）
   - 実際のデザインを確認できる
   - インタラクティブな動作を確認できる
   - レスポンシブデザインを確認できる
   - 実装の視覚的な目標が明確になる

2. **チャットURL**（補足情報として）
   - 実装の意図やコンテキストが分かる
   - デザインの意図や仕様の詳細が分かる
   - 既に生成されたコードがある場合は参考になる

##### 引き継ぎ時の情報
以下の情報をCursorチャットで共有してください：

```
【Figma Make引き継ぎ情報】

1. プレビューサイトURL: [URLを貼り付け]
2. チャットURL（あれば）: [URLを貼り付け]
3. 実装するコンポーネント名: [例: AlbumEditForm]
4. 実装するページ/機能: [例: アルバム編集ページ]
5. 既存コンポーネントとの統合: [例: AlbumCreator.tsxと統合]
6. データベース操作: [例: albumsテーブルの更新]
```

#### 3. Figma Makeでコンポーネント生成（既に生成済みの場合）
1. Figma Makeでコンポーネントを選択
2. React/TypeScript形式でエクスポート
3. 生成されたコードを`src/components/figma/`に配置

#### 4. コンポーネントの統合
- shadcn/uiコンポーネントと統合
- 型定義を追加
- スタイルを調整（必要に応じて）
- Supabase連携を追加（必要に応じて）

### Cursorでの実装（Supabase・Vercel連携済み）

#### 1. 事前準備
- `.cursorrules`を確認（自動読み込み済み）
- `docs/project/HANDOVER.md`を参照してプロジェクトの状態を確認
- `docs/project/DEVELOPMENT_GUIDE.md`で実装パターンを確認

#### 2. Figma Makeからの実装フロー（推奨手順）

##### ステップ1: 引き継ぎ情報の共有
Cursorチャットで以下を共有：
```
【Figma Make引き継ぎ情報】

1. プレビューサイトURL: [URL]
2. チャットURL（あれば）: [URL]
3. 実装するコンポーネント名: [例: AlbumEditForm]
4. 実装するページ/機能: [例: アルバム編集ページ]
5. 既存コンポーネントとの統合: [例: AlbumCreator.tsxと統合]
6. データベース操作: [例: albumsテーブルの更新]
```

##### ステップ2: 要件の確認
1. **Figmaデザインの確認**
   - プレビューサイトURLでデザインを確認
   - インタラクティブな動作を確認
   - レスポンシブデザインを確認

2. **既存コードの確認**
   - 既存のコンポーネントを確認（`src/components/`）
   - 既存のページを確認（`src/app/`）
   - データベーススキーマを確認（`supabase/sql/`）

3. **データベース要件の確認**
   - 新しいテーブルが必要か
   - 既存テーブルの変更が必要か
   - RLSポリシーの追加が必要か

##### ステップ3: データベース変更（必要な場合）
1. `supabase/sql/`にSQLスクリプトを作成
2. Supabaseダッシュボード > SQL Editorで実行
3. 型定義を再生成: `npm run supabase:types`
4. 変更内容をCursorチャットで共有

##### ステップ4: 型定義の作成
1. `src/types/`に型定義を追加（必要に応じて）
2. Supabase型を活用（`src/types/supabase.ts`）
3. コンポーネントのProps型を定義

##### ステップ5: コンポーネントの実装
1. **Figma Makeコンポーネントの配置**
   - 生成されたコードがあれば`src/components/figma/`に配置
   - プレビューサイトからコードを生成する場合は指示

2. **コンポーネントの統合**
   - shadcn/uiコンポーネントと統合
   - 既存コンポーネントとの統合
   - 型定義を追加

3. **スタイリング**
   - Tailwind CSSを使用
   - レスポンシブデザインを考慮
   - Figmaデザインを厳密に再現

##### ステップ6: ページの実装
1. `src/app/`にページを作成
2. 認証ガードを追加（必要に応じて）
3. コンポーネントを統合
4. エラーハンドリングを実装

##### ステップ7: Supabase連携
1. **データベース操作**
   - Supabaseクライアントを使用（`@/lib/supabase`）
   - RLSポリシーを確認
   - エラーハンドリングを実装

2. **Storage操作（必要な場合）**
   - ファイル名のサニタイズ（日本語対応）
   - `photos`バケットへのアップロード
   - 署名付きURLの生成

##### ステップ8: ローカルテスト
1. 開発サーバー起動: `npm run dev`
2. 手動テストを実施
3. エッジケースを確認
4. エラーメッセージを確認
5. レスポンシブデザインを確認

##### ステップ9: Vercelへのデプロイ（自動）
1. Gitにコミット・プッシュ
2. Vercelが自動的にデプロイ
3. デプロイ後の動作確認

##### ステップ10: 本番環境での確認
1. VercelのプレビューURLで確認
2. Supabaseの本番環境で動作確認
3. 認証フローの確認
4. データベース操作の確認

#### 3. 実装時の注意事項

##### エラーハンドリング
- すべての非同期処理にtry-catchを実装
- ユーザーフレンドリーなエラーメッセージを表示
- コンソールログは開発時のみ（本番では削除）

##### 型安全性
- `any`型の使用は避ける
- Supabase型を活用
- コンポーネントのProps型を明確に定義

##### パフォーマンス
- 画像の遅延読み込みを実装
- 不要な再レンダリングを避ける
- Supabaseクエリは適切にインデックスを使用

##### セキュリティ
- RLSポリシーを適切に設定
- ユーザー入力は必ずサニタイズ
- ファイルアップロードはサイズ制限を設定

### Supabase連携

#### 1. データベーススキーマの変更
1. `supabase/sql/`にSQLスクリプトを作成
2. Supabaseダッシュボード > SQL Editorで実行
3. 型定義を再生成: `npm run supabase:types`

#### 2. RLSポリシーの設定
- すべてのテーブルにRLSを有効化
- 適切なポリシーを設定
- テストユーザーで動作確認

#### 3. Storageの設定
- バケットの作成
- RLSポリシーの設定
- ファイルアップロードのテスト

## クイックリファレンス：Figma Make実装フロー

### 最小限の引き継ぎ情報（推奨）
```
【Figma Make引き継ぎ情報】

1. プレビューサイトURL: [URL]
2. 実装するコンポーネント名: [例: AlbumEditForm]
3. 実装するページ/機能: [例: アルバム編集ページ]
```

### 完全な引き継ぎ情報（推奨）
```
【Figma Make引き継ぎ情報】

1. プレビューサイトURL: [URL]
2. チャットURL（あれば）: [URL]
3. 実装するコンポーネント名: [例: AlbumEditForm]
4. 実装するページ/機能: [例: アルバム編集ページ]
5. 既存コンポーネントとの統合: [例: AlbumCreator.tsxと統合]
6. データベース操作: [例: albumsテーブルの更新]
7. 認証が必要か: [はい/いいえ]
```

### 実装フローのチェックリスト
- [ ] Figma Makeの引き継ぎ情報を共有
- [ ] プレビューサイトでデザインを確認
- [ ] 既存コードを確認
- [ ] データベース要件を確認
- [ ] データベース変更（必要な場合）
- [ ] 型定義を作成
- [ ] コンポーネントを実装
- [ ] ページを実装
- [ ] Supabase連携を実装
- [ ] ローカルテスト
- [ ] Gitにコミット・プッシュ
- [ ] Vercelで自動デプロイ
- [ ] 本番環境で確認

## 実装パターン

### 認証が必要なページ
```typescript
"use client";

import { AuthGuard } from "@/components/AuthGuard";

export default function ProtectedPage() {
  return (
    <AuthGuard>
      {/* ページコンテンツ */}
    </AuthGuard>
  );
}
```

### Supabaseクエリ
```typescript
import { supabase } from "@/lib/supabase";

// データ取得
const { data, error } = await supabase
  .from("albums")
  .select("*")
  .eq("owner_id", user.id);

if (error) {
  console.error("エラー:", error);
  // エラーハンドリング
}
```

### エラーハンドリング
```typescript
try {
  const { data, error } = await supabase
    .from("albums")
    .insert({ ... });

  if (error) {
    throw error;
  }
} catch (error) {
  console.error("エラー:", error);
  // ユーザーフレンドリーなエラーメッセージを表示
}
```

### ファイルアップロード
```typescript
// ファイル名のサニタイズ
const sanitizedName = fileName
  .replace(/[^a-zA-Z0-9_-]/g, '_')
  .substring(0, 50);

// Storageへのアップロード
const { data, error } = await supabase.storage
  .from("photos")
  .upload(`${user.id}/${timestamp}-${sanitizedName}`, file);

if (error) {
  throw new Error(`アップロードエラー: ${error.message}`);
}
```

## デバッグ

### コンソールログ
- 開発時のみ使用
- 本番コードからは削除
- エラーログは必ず記録

### Supabaseダッシュボード
- SQL Editorでクエリを実行
- Table Editorでデータを確認
- Logsでエラーを確認

### ブラウザ開発者ツール
- NetworkタブでAPIリクエストを確認
- Consoleタブでエラーを確認
- ApplicationタブでLocalStorageを確認

## トラブルシューティング

### 認証エラー
- `.env.local`が正しく設定されているか確認
- SupabaseダッシュボードでリダイレクトURLを確認
- ブラウザのコンソールでエラーを確認

### データベースエラー
- RLSポリシーを確認
- テーブル構造を確認
- SQL Editorで直接クエリを実行

### ビルドエラー
- 型定義を再生成: `npm run supabase:types`
- 依存関係を再インストール: `npm install`
- キャッシュをクリア: `rm -rf .next`

## コミット規約

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `style:` コードスタイル
- `refactor:` リファクタリング
- `test:` テスト
- `chore:` その他

## 参考資料

- [実装状況](IMPLEMENTATION_STATUS.md)
- [セットアップガイド](../setup/SETUP_GUIDE.md)
- [データベース構造](../database/TABLE_STRUCTURE.md)
- [サンプルデータ管理](../data/SAMPLE_DATA_MANAGEMENT.md)

