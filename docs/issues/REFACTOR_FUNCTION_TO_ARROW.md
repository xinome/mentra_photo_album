# 🔧 Function形式からアロー関数式へのリファクタリング

## 🔧 リファクタリングの概要

プロジェクト全体の関数定義を、従来の`function`形式からアロー関数式（arrow function）に統一します。コードの一貫性を向上させ、モダンなJavaScript/TypeScriptのスタイルに合わせます。

## 🎯 目的

* コードスタイルの統一（アロー関数式への統一）
* モダンなJavaScript/TypeScriptコーディング規約への準拠
* コードの可読性向上
* 一貫性の向上によるメンテナンス性の向上

## 📊 調査結果

### 対象範囲

プロジェクト全体で**約295箇所**の`function`形式の関数定義を確認しました。

#### カテゴリ別内訳

1. **ユーティリティ関数（lib配下）**: 5ファイル
2. **カスタムコンポーネント**: 約51ファイル
3. **ページコンポーネント**: 約14ファイル
4. **UIコンポーネント（shadcn/ui）**: 約30ファイル（**変更対象外**）

### 詳細な対象箇所

## ✅ リファクタリング計画

### フェーズ1: ユーティリティ関数（影響範囲が明確・小さい順）

#### 1.1 `lib/config.ts`
- **対象関数**:
  - `getBaseUrl()` (11行目)
  - `getAuthRedirectUrl()` (36行目)
- **使用箇所**: `src/app/(auth)/login/page.tsx` (2箇所)
- **影響範囲**: 小（1ファイルのみ）
- **優先度**: 高

#### 1.2 `lib/auth-errors.ts`
- **対象関数**:
  - `getAuthErrorMessage()` (6行目)
  - `getAuthErrorType()` (54行目)
- **使用箇所**: `src/app/(auth)/login/page.tsx` (2箇所)
- **影響範囲**: 小（1ファイルのみ）
- **優先度**: 高

#### 1.3 `lib/category-images.ts`
- **対象関数**:
  - `getCategoryDefaultImage()` (20行目)
- **使用箇所**:
  - `src/components/AlbumCreator.tsx`
  - `src/app/albums/[id]/edit/page.tsx`
  - `src/components/AlbumEditor.tsx`
  - `src/app/albums/[id]/page.tsx` (3箇所)
- **影響範囲**: 中（4ファイル、合計6箇所）
- **優先度**: 高

#### 1.4 `components/ui/utils.ts`
- **対象関数**:
  - `cn()` (4行目)
- **使用箇所**: プロジェクト全体で多用
- **影響範囲**: 大（多数のファイル）
- **優先度**: 中（影響範囲が大きいため慎重に実施）

### フェーズ2: カスタムフック

#### 2.1 `components/ui/use-mobile.ts`
- **対象関数**:
  - `useIsMobile()` (5行目)
- **使用箇所**: 要確認
- **影響範囲**: 要確認
- **優先度**: 中

### フェーズ3: カスタムコンポーネント（段階的に実施）

#### 主要コンポーネント（使用箇所が多い順）

1. **`Header`** - 10ファイル以上で使用
2. **`AuthProvider`** - 10ファイル以上で使用
3. **`AuthGuard`** - 8ファイル以上で使用
4. **`Dashboard`** - 3ファイルで使用
5. **`AlbumCreator`** - 3ファイルで使用
6. **`AlbumViewer`** - 3ファイルで使用
7. **`MagicLinkLogin`** - 3ファイルで使用
8. **`ProfileSetup`** - 3ファイルで使用

その他多数のコンポーネント:
- `DashboardClient`
- `AlbumEditor`
- `LoginForm`
- `SharedAlbumViewer`
- `PhotoManagementSection`
- `PhotoUploadSection`
- `StorageUsageSection`
- `AlbumStorageSection`
- `StorageManagementSection`
- `FileListSection`
- `AccountManagementSection`
- `ProfileSection`
- `SecuritySection`
- `PrivacySection`
- `DangerZoneSection`
- `PhotoSnackbar`
- `Snackbar`
- `ImageWithFallback`
- など

### フェーズ4: ページコンポーネント（任意）

#### Next.js App Routerのページコンポーネント
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/albums/page.tsx`
- `src/app/albums/create/page.tsx`
- `src/app/albums/[id]/page.tsx`
- `src/app/albums/[id]/edit/page.tsx`
- `src/app/account/page.tsx`
- `src/app/account/setup/page.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/auth/callback/page.tsx`
- `src/app/share/[token]/page.tsx`
- `src/app/storage/page.tsx`
- `src/app/demo/page.tsx`

**注意**: Next.jsのApp Routerでは`export default function`が一般的なため、変更は任意です。

## 📁 変更ファイル（推定）

### フェーズ1
* `src/lib/config.ts` - function → アロー関数式
* `src/lib/auth-errors.ts` - function → アロー関数式
* `src/lib/category-images.ts` - function → アロー関数式
* `src/components/ui/utils.ts` - function → アロー関数式

### フェーズ2
* `src/components/ui/use-mobile.ts` - function → アロー関数式

### フェーズ3
* `src/components/Header.tsx` - function → アロー関数式
* `src/components/AuthProvider.tsx` - function → アロー関数式
* `src/components/AuthGuard.tsx` - function → アロー関数式
* `src/components/Dashboard.tsx` - function → アロー関数式
* `src/components/DashboardClient.tsx` - function → アロー関数式
* `src/components/AlbumCreator.tsx` - function → アロー関数式
* `src/components/AlbumEditor.tsx` - function → アロー関数式
* `src/components/AlbumViewer.tsx` - function → アロー関数式
* `src/components/MagicLinkLogin.tsx` - function → アロー関数式
* `src/components/MagicLinkSent.tsx` - function → アロー関数式
* `src/components/ProfileSetup.tsx` - function → アロー関数式
* `src/components/LoginForm.tsx` - function → アロー関数式
* `src/components/SharedAlbumViewer.tsx` - function → アロー関数式
* `src/components/AlbumsListClient.tsx` - function → アロー関数式
* `src/components/figma/ImageWithFallback.tsx` - function → アロー関数式
* `src/components/ui/snackbar.tsx` - function → アロー関数式
* `src/app/albums/[id]/components/PhotoManagementSection.tsx` - function → アロー関数式
* `src/app/albums/[id]/components/PhotoUploadSection.tsx` - function → アロー関数式
* `src/app/albums/[id]/components/PhotoSnackbar.tsx` - function → アロー関数式
* `src/app/storage/components/StorageUsageSection.tsx` - function → アロー関数式
* `src/app/storage/components/AlbumStorageSection.tsx` - function → アロー関数式
* `src/app/storage/components/StorageManagementSection.tsx` - function → アロー関数式
* `src/app/storage/components/FileListSection.tsx` - function → アロー関数式
* `src/app/account/components/AccountManagementSection.tsx` - function → アロー関数式
* `src/app/account/components/ProfileSection.tsx` - function → アロー関数式
* `src/app/account/components/SecuritySection.tsx` - function → アロー関数式
* `src/app/account/components/PrivacySection.tsx` - function → アロー関数式
* `src/app/account/components/DangerZoneSection.tsx` - function → アロー関数式

### フェーズ4（任意）
* 上記ページコンポーネント（14ファイル）

## ⚠️ 注意事項

### 変更対象外
* **`src/components/ui/`配下のshadcn/uiコンポーネント**（約30ファイル）
  - 外部ライブラリ由来のコードのため変更しない
  - 変更するとライブラリのアップデート時に競合する可能性がある

### 技術的な注意点

1. **ホイスティング（Hoisting）の違い**
   - `function`宣言はホイストされる（関数定義前に呼び出し可能）
   - アロー関数はホイストされない（定義後に呼び出し可能）
   - プロジェクト内では通常、定義後に使用されているため問題なし

2. **`this`の扱い**
   - アロー関数は`this`をバインドしない
   - Reactコンポーネントでは通常`this`を使用しないため問題なし

3. **型定義の整合性**
   - TypeScriptではアロー関数でも型推論は維持される
   - 明示的な型定義も維持される

4. **パフォーマンス**
   - 実行時のパフォーマンスへの影響はほぼなし

## ✅ 検証項目

### フェーズ1（ユーティリティ関数）
* [ ] `getBaseUrl()`が正常に動作すること
* [ ] `getAuthRedirectUrl()`が正常に動作すること
* [ ] ログインページでMagic Link認証が正常に動作すること
* [ ] `getAuthErrorMessage()`が正常に動作すること
* [ ] エラーメッセージが正しく表示されること
* [ ] `getCategoryDefaultImage()`が正常に動作すること
* [ ] アルバム作成・編集・詳細ページでカテゴリ画像が正しく表示されること
* [ ] `cn()`関数が正常に動作すること
* [ ] 全コンポーネントでスタイリングが正常に動作すること

### フェーズ2（カスタムフック）
* [ ] `useIsMobile()`が正常に動作すること
* [ ] モバイルレスポンシブが正常に動作すること

### フェーズ3（カスタムコンポーネント）
* [ ] 各コンポーネントが正常にレンダリングされること
* [ ] プロップスが正しく渡されること
* [ ] イベントハンドラーが正常に動作すること
* [ ] 既存機能が正常に動作すること

### フェーズ4（ページコンポーネント・任意）
* [ ] 各ページが正常に表示されること
* [ ] ルーティングが正常に動作すること
* [ ] サーバーコンポーネントの動作が正常であること（該当する場合）

### 全体検証
* [ ] ビルドエラーが発生しないこと
* [ ] 型チェックが通ること（`npm run type-check`）
* [ ] リンターエラーが発生しないこと（`npm run lint`）
* [ ] 既存機能がすべて正常に動作すること
* [ ] パフォーマンスに影響がないこと

## 📝 実装時の方針

### 変換例

#### Before (function形式)
```typescript
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}
```

#### After (アロー関数式)
```typescript
export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};
```

#### コンポーネントの例

##### Before
```typescript
export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header>
      {/* ... */}
    </header>
  );
}
```

##### After
```typescript
export const Header = ({ user, onLogout }: HeaderProps) => {
  return (
    <header>
      {/* ... */}
    </header>
  );
};
```

## 📚 関連ドキュメント

* [開発ガイド](../project/DEVELOPMENT_GUIDE.md)
* [実装状況](../project/IMPLEMENTATION_STATUS.md)
* [コーディング規約](../../.cursorrules)

## 🏷️ ラベル

* `refactor` - リファクタリング
* `frontend` - フロントエンド関連
* `typescript` - TypeScript関連
* `code-quality` - コード品質向上

---

**作成日**: 2026年01月
**優先度**: 中
**見積もり**: フェーズ1: 1-2時間、フェーズ2-3: 3-5時間、フェーズ4: 任意
