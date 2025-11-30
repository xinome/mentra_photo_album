# Step 1 実装指示 - Cursor用

## 📋 概要

現在の `/albums` ページを `/dashboard` に変更し、新しい `/albums` を全件表示ページとして作成します。

---

## ✅ 完了済み（Figma Makeで作成済み）

以下のファイルは既に作成されています：

- ✅ `/components/DashboardClient.tsx` - ダッシュボード用クライアントコンポーネント
- ✅ `/components/AlbumsListClient.tsx` - アルバム一覧用クライアントコンポーネント
- ✅ `/utils/supabase/server.ts` - サーバーサイドSupabaseクライアント

---

## 🔨 Cursorでの実装手順

### 手順1: 現在の /albums を /dashboard に移動

現在のプロジェクトに `app/albums/page.tsx` が存在する場合、それを `app/dashboard/page.tsx` に移動してください。

```bash
# ターミナルで実行（または手動で移動）
mkdir -p app/dashboard
mv app/albums/page.tsx app/dashboard/page.tsx
```

**重要**: 
- `app/albums/` ディレクトリ内に他のファイル（`layout.tsx`, `loading.tsx`等）がある場合も同様に移動してください
- 移動後、`app/albums/` ディレクトリは一旦空にしてください

---

### 手順2: /dashboard ページの更新

`app/dashboard/page.tsx` を以下のように更新してください：

```tsx
import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/DashboardClient';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'ダッシュボード | Mentra Photo Album',
  description: '最近のアルバムと写真を管理',
};

async function getRecentAlbums() {
  const supabase = await createClient();
  
  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }
  
  // 最新6件のアルバムを取得
  const { data: albums, error } = await supabase
    .from('albums')
    .select(`
      *,
      photos(count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(6);
  
  if (error) {
    console.error('アルバム取得エラー:', error);
    return [];
  }
  
  return albums || [];
}

async function getStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { totalAlbums: 0, totalPhotos: 0, sharedAlbums: 0 };
  
  // 統計情報を取得
  const { count: albumCount } = await supabase
    .from('albums')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  
  const { count: photoCount } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('uploaded_by', user.id);
  
  const { count: sharedCount } = await supabase
    .from('albums')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_shared', true);
  
  return {
    totalAlbums: albumCount || 0,
    totalPhotos: photoCount || 0,
    sharedAlbums: sharedCount || 0,
  };
}

export default async function DashboardPage() {
  const [albums, stats] = await Promise.all([
    getRecentAlbums(),
    getStats(),
  ]);
  
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient albums={albums} stats={stats} />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
    </div>
  );
}
```

**ポイント**:
- `.limit(6)` で最新6件のみ取得
- 統計情報も並行して取得
- `DashboardClient` コンポーネントに渡す

---

### 手順3: 新しい /albums 一覧ページを作成

`app/albums/page.tsx` を新規作成してください：

```tsx
import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AlbumsListClient } from '@/components/AlbumsListClient';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'アルバム一覧 | Mentra Photo Album',
  description: '全てのアルバムを表示',
};

async function getAllAlbums() {
  const supabase = await createClient();
  
  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }
  
  // 全アルバムを取得
  const { data: albums, error } = await supabase
    .from('albums')
    .select(`
      *,
      photos(count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('アルバム取得エラー:', error);
    return [];
  }
  
  return albums || [];
}

export default async function AlbumsPage() {
  const albums = await getAllAlbums();
  
  return (
    <Suspense fallback={<AlbumsListSkeleton />}>
      <AlbumsListClient albums={albums} />
    </Suspense>
  );
}

function AlbumsListSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-12 w-64 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
    </div>
  );
}
```

**ポイント**:
- 全件取得（`.limit()` なし）
- フィルタリングは `AlbumsListClient` で実装済み

---

### 手順4: ヘッダーにナビゲーションを追加

`components/Header.tsx` を更新して、ナビゲーションリンクを追加してください。

**追加する内容**:

```tsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ... 既存のインポート ...

export function Header({ user, onLogout, /* 既存のprops */ }: HeaderProps) {
  const pathname = usePathname();  // ← 追加
  
  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Mentra</span>
          </Link>
          
          {/* ナビゲーション - ここに追加 */}
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/dashboard"
                className={`text-sm transition-colors ${
                  pathname === '/dashboard' 
                    ? 'text-primary font-medium' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ダッシュボード
              </Link>
              <Link 
                href="/albums"
                className={`text-sm transition-colors ${
                  pathname === '/albums' 
                    ? 'text-primary font-medium' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                アルバム一覧
              </Link>
            </nav>
          )}
          
          {/* 既存のユーザーメニュー */}
          {/* ... */}
        </div>
      </div>
    </header>
  );
}
```

**重要**:
- `'use client'` ディレクティブを追加（`usePathname`を使うため）
- ログイン済みユーザーにのみナビゲーションを表示
- 現在のページをハイライト

---

### 手順5: 既存のアルバム作成・詳細ページのパスを確認

以下のルートが存在する場合、パスが正しいことを確認してください：

- `app/albums/create/page.tsx` - アルバム作成ページ
- `app/albums/[id]/page.tsx` - アルバム詳細ページ

これらのパスは変更しません。

---

## 🧪 動作確認

### 1. ダッシュボードページ（/dashboard）

ブラウザで `http://localhost:3000/dashboard` にアクセスして確認：

- [ ] ページが表示される
- [ ] 最新6件のアルバムが表示される
- [ ] 統計情報（総アルバム数、総写真数、共有中）が表示される
- [ ] 「新しいアルバムを作成」ボタンが動作する
- [ ] 6件以上ある場合「すべて表示」ボタンが表示される
- [ ] 「すべて表示」ボタンクリックで `/albums` に遷移

### 2. アルバム一覧ページ（/albums）

ブラウザで `http://localhost:3000/albums` にアクセスして確認：

- [ ] 全てのアルバムが表示される
- [ ] 検索バーが動作する（タイトル・説明で検索）
- [ ] カテゴリフィルターが動作する
- [ ] ソート機能が動作する（作成日順、タイトル順）
- [ ] アルバムカードをクリックすると `/albums/[id]` に遷移

### 3. ヘッダーナビゲーション

- [ ] 「ダッシュボード」リンクが表示される
- [ ] 「アルバム一覧」リンクが表示される
- [ ] 現在のページがハイライトされる（プライマリカラー）
- [ ] クリックで正しいページに遷移する

### 4. レスポンシブ対応

- [ ] モバイル（375px）で正しく表示される
- [ ] タブレット（768px）で正しく表示される
- [ ] デスクトップ（1024px）で正しく表示される

---

## ❌ トラブルシューティング

### エラー: "createClient is not a function"

**原因**: `/utils/supabase/server.ts` が正しくインポートされていない

**解決方法**:
```tsx
import { createClient } from '@/utils/supabase/server';
// ✅ 正しい

import { createClient } from '@/utils/supabase/client';
// ❌ 間違い（これはクライアントコンポーネント用）
```

### エラー: "usePathname is not a function"

**原因**: Header コンポーネントに `'use client'` がない

**解決方法**:
```tsx
'use client';  // ← 追加

import { usePathname } from 'next/navigation';
// ...
```

### エラー: "Cannot read property 'map' of undefined"

**原因**: アルバムデータが `null` または `undefined`

**解決方法**:
```tsx
// サーバーコンポーネントで
return albums || [];  // ← エラー時は空配列を返す
```

### ページが真っ白

**原因**: JavaScriptエラーが発生している

**確認手順**:
1. ブラウザのコンソール（F12）を開く
2. エラーメッセージを確認
3. ターミナルのログも確認

### アルバムが表示されない

**原因**: Supabaseのデータ取得に失敗している

**確認手順**:
1. `console.log(albums)` でデータを確認
2. Supabase RLSポリシーを確認
3. テーブルにデータが存在するか確認

---

## 📝 実装後のチェックリスト

実装が完了したら、以下を確認してください：

- [ ] `/dashboard` にアクセスできる
- [ ] `/albums` にアクセスできる
- [ ] ヘッダーナビゲーションが動作する
- [ ] 検索・フィルター・ソートが動作する
- [ ] アルバムカードのクリックで詳細ページに遷移する
- [ ] レスポンシブデザインが正しく表示される
- [ ] コンソールにエラーがない

---

## ✅ Step 1 完了

全ての確認項目がクリアできたら、**Step 1は完了**です！

次は **Step 2: アイキャッチ画像機能の実装** に進みます。

準備ができたら「Step 2を開始してください」とお知らせください。
