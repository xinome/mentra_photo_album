# ダッシュボード・アルバム一覧でアイキャッチ画像が表示されない問題

## 📝 概要

ダッシュボードとアルバム一覧でサムネイルになっている画像が、設定したアイキャッチ画像（`cover_photo_id`）でなく、アルバムの1枚目の写真になっている問題が発生しています。

## 🐛 問題の詳細

### 発生箇所

1. **ダッシュボード** (`/dashboard`)
   - ファイル: `src/app/dashboard/page.tsx`
   - 関数: `getRecentAlbums()` (49-74行目)

2. **アルバム一覧** (`/albums`)
   - ファイル: `src/app/albums/page.tsx`
   - 関数: `getAllAlbums()` (47-72行目)

3. **ストレージ管理画面** (`/storage`)（可能性あり）
   - ファイル: `src/app/storage/page.tsx`
   - 115-128行目

### 現状の実装

現在の実装では、アルバムのカバー画像を取得する際に、`albums`テーブルの`cover_photo_id`カラムを参照せず、以下のロジックで最初の写真を取得しています：

```typescript
// カバー画像を取得
let coverImage = "https://images.unsplash.com/photo-1587955793432-7c4ff80918ba?w=400";
if (photoCount > 0) {
  const { data: firstPhoto } = await supabase
    .from('photos')
    .select('storage_key')
    .eq('album_id', album.id)
    .order('created_at', { ascending: true })  // ← 最初の写真を取得
    .limit(1)
    .single();
  // ...
}
```

### データベース構造

`albums`テーブルには`cover_photo_id`カラムが存在し、アイキャッチ画像として設定された写真のIDが保存されています：

```sql
CREATE TABLE IF NOT EXISTS public.albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  cover_photo_id uuid,  -- ← アイキャッチ画像のID
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 正しい実装例

`src/app/albums/[id]/page.tsx`では、正しく`cover_photo_id`を参照しています（155-184行目）：

```typescript
// カバー画像が設定されている場合はそれを取得
if (album.cover_photo_id) {
  const { data: coverPhoto } = await supabase
    .from("photos")
    .select("storage_key")
    .eq("id", album.cover_photo_id)  // ← cover_photo_idを参照
    .single();
  // ...
} else if (photos.length > 0) {
  // カバー画像が設定されていない場合は最初の写真を使用
  coverImage = photos[0].url;
} else {
  // 写真もない場合はカテゴリのデフォルト画像を使用
  coverImage = getCategoryDefaultImage(album.category);
}
```

## ✅ 改善案

### 修正方針

以下の優先順位でカバー画像を取得するように修正します：

1. **`cover_photo_id`が設定されている場合**: その写真を取得
2. **`cover_photo_id`が設定されていないが写真がある場合**: 最初の写真を使用（フォールバック）
3. **写真もない場合**: カテゴリのデフォルト画像を使用（`getCategoryDefaultImage`関数を使用）

### 修正が必要なファイル

#### 1. `src/app/dashboard/page.tsx`

`getRecentAlbums()`関数内のカバー画像取得ロジックを修正：

```typescript
// カバー画像を取得
let coverImage = getCategoryDefaultImage(album.category);
if (album.cover_photo_id) {
  // cover_photo_idが設定されている場合はその写真を取得
  const { data: coverPhoto } = await supabase
    .from('photos')
    .select('storage_key')
    .eq('id', album.cover_photo_id)
    .single();
  
  if (coverPhoto && (coverPhoto as any).storage_key) {
    const photoKey = (coverPhoto as any).storage_key;
    if (photoKey?.startsWith('http')) {
      coverImage = photoKey;
    } else {
      const { data: signedUrl } = await supabase.storage
        .from('photos')
        .createSignedUrl(photoKey, 3600);
      if (signedUrl) {
        coverImage = signedUrl.signedUrl;
      }
    }
  }
} else if (photoCount > 0) {
  // cover_photo_idが設定されていない場合は最初の写真を使用
  const { data: firstPhoto } = await supabase
    .from('photos')
    .select('storage_key')
    .eq('album_id', album.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();
  
  if (firstPhoto) {
    const photoKey = (firstPhoto as any).storage_key;
    if (photoKey?.startsWith('http')) {
      coverImage = photoKey;
    } else {
      const { data: signedUrl } = await supabase.storage
        .from('photos')
        .createSignedUrl(photoKey, 3600);
      if (signedUrl) {
        coverImage = signedUrl.signedUrl;
      }
    }
  }
}
```

#### 2. `src/app/albums/page.tsx`

`getAllAlbums()`関数内のカバー画像取得ロジックを同様に修正。

#### 3. `src/app/storage/page.tsx`

ストレージ管理画面でも同様の問題がある可能性があるため、確認して修正。

### 必要なインポート

`getCategoryDefaultImage`関数を使用するため、以下のインポートを追加：

```typescript
import { getCategoryDefaultImage } from '@/lib/category-images';
```

## 📁 変更ファイル

### 修正予定

- `src/app/dashboard/page.tsx` - `getRecentAlbums()`関数のカバー画像取得ロジックを修正
- `src/app/albums/page.tsx` - `getAllAlbums()`関数のカバー画像取得ロジックを修正
- `src/app/storage/page.tsx` - カバー画像取得ロジックを確認・修正（必要に応じて）

## ✅ 検証項目

修正後、以下の項目を検証します：

- [ ] ダッシュボードで、アイキャッチ画像を設定したアルバムのサムネイルが正しく表示される
- [ ] アルバム一覧で、アイキャッチ画像を設定したアルバムのサムネイルが正しく表示される
- [ ] アイキャッチ画像が設定されていないアルバムは、最初の写真がサムネイルとして表示される
- [ ] 写真がないアルバムは、カテゴリのデフォルト画像がサムネイルとして表示される
- [ ] ストレージ管理画面でも同様に正しく表示される（該当する場合）

## 🔧 技術的な詳細

### カバー画像取得の優先順位

1. **`cover_photo_id`が設定されている場合**
   - `photos`テーブルから`cover_photo_id`に一致する写真を取得
   - `storage_key`がURLの場合は直接使用
   - それ以外はSupabase Storageから署名付きURLを取得

2. **`cover_photo_id`が設定されていないが写真がある場合**
   - アルバムの最初の写真（`created_at`が最も古い）を取得
   - フォールバックとして使用

3. **写真もない場合**
   - `getCategoryDefaultImage()`関数を使用してカテゴリのデフォルト画像を取得

### エラーハンドリング

- `cover_photo_id`で写真を取得できない場合（削除された写真など）は、フォールバック処理に移行
- Storageからの署名付きURL取得に失敗した場合も、フォールバック処理に移行

## 📚 関連Issue

- `docs/issues/ALBUM_EDIT_IMPROVEMENT_BODY.txt` - アルバム編集機能でアイキャッチ画像の設定・保存が実装済み

## 🎯 次のステップ

1. 上記の3ファイルを修正
2. 動作確認を実施
3. 必要に応じて、他の箇所でも同様の問題がないか確認

## ⚠️ 注意事項

- `cover_photo_id`で参照される写真が削除されている場合、エラーハンドリングが必要
- 既存のアルバムで`cover_photo_id`が設定されていない場合は、現在の動作（最初の写真を使用）が維持される
