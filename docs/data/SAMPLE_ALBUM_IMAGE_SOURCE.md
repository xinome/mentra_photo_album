# サンプルアルバムの画像参照先について

## 概要

現在表示されているサンプルアルバムの画像は、Supabase Storageではなく、**Unsplashの画像URL**を直接`storage_key`として保存しています。

## 実装の詳細

### 1. サンプルデータの投入方法

`supabase/sql/sample-data.sql`で、以下のようにUnsplashの画像URLを`storage_key`として直接保存しています：

```sql
INSERT INTO public.photos (album_id, uploader_id, storage_key, caption, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111'::uuid, current_user_id, 
   'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80', 
   '美しい沖縄の海！最高の景色でした。', now() - interval '5 days'),
  -- ...
```

### 2. 画像表示のロジック

`src/app/albums/page.tsx`の307-320行目で、以下のロジックで画像を取得しています：

```typescript
// カバー画像を取得（最初の写真）
let coverImage = "https://images.unsplash.com/photo-1587955793432-7c4ff80918ba?w=400";
if (firstPhoto && firstPhoto.length > 0) {
  // storage_keyがURLの場合は直接使用、それ以外はStorageから取得
  if (firstPhoto[0].storage_key.startsWith('http')) {
    coverImage = firstPhoto[0].storage_key;
  } else {
    const { data: signedUrl } = await supabase.storage
      .from("photos")
      .createSignedUrl(firstPhoto[0].storage_key, 3600);
    if (signedUrl) {
      coverImage = signedUrl.signedUrl;
    }
  }
}
```

### 3. 動作の仕組み

1. **`storage_key`が`http`で始まる場合**：
   - UnsplashのURLとして直接使用
   - Supabase Storageへのアクセスは不要

2. **`storage_key`が`http`で始まらない場合**：
   - Supabase Storageのファイルパスとして扱う
   - `createSignedUrl`で署名付きURLを取得

## 現在の状態

- **Supabase Storage (`photos`バケット)**：空（実際のファイルは保存されていない）
- **`photos`テーブル**：UnsplashのURLが`storage_key`として保存されている
- **表示**：Unsplashの画像が直接表示される

## 注意事項

1. **本番環境での使用**：
   - Unsplashの画像URLは外部依存のため、長期的な可用性は保証されません
   - 実際のアプリケーションでは、ユーザーがアップロードした画像をSupabase Storageに保存する必要があります

2. **新しいアルバム作成時**：
   - `handleSaveAlbum`関数では、実際のファイルをSupabase Storageにアップロードします
   - そのため、新規作成されたアルバムの画像はSupabase Storageから取得されます

3. **移行の必要性**：
   - 将来的にサンプルデータを実際のSupabase Storageに移行する場合は、画像をダウンロードしてアップロードする必要があります

## 参照先の確認方法

1. **Supabaseダッシュボード**：
   - `photos`テーブルを確認 → `storage_key`カラムにUnsplashのURLが保存されている
   - `Storage > photos`バケット → 空であることを確認

2. **ブラウザの開発者ツール**：
   - ネットワークタブで画像リクエストを確認
   - `images.unsplash.com`からのリクエストが表示される

