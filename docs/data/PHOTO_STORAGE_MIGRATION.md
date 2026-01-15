# 写真をSupabase Storageに保存する方法

## 概要

現在、サンプルアルバムの写真はUnsplashのURLを`storage_key`として保存しています。実際の画像ファイルをSupabase Storageに保存する方法を説明します。

## 重要な注意事項

**SQLだけでは画像をSupabase Storageに保存することはできません。**

理由：
- PostgreSQLのSQLからHTTPリクエストを送信して画像をダウンロードすることはできない
- Supabase Storageへのファイルアップロードは、通常API経由で行う必要がある

## 解決方法

### 方法1: アプリケーション側で実装（推奨）

アプリケーション側で、UnsplashのURLから画像をダウンロードし、Supabase Storageにアップロードするスクリプトを作成します。

#### 実装例（Node.js/TypeScript）

```typescript
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { Readable } from 'stream';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // サービスロールキーが必要
);

async function migratePhotosToStorage() {
  // 1. Unsplash URLを使用している写真を取得
  const { data: photos, error } = await supabase
    .from('photos')
    .select('*')
    .like('storage_key', 'https://images.unsplash.com%');

  if (error) {
    console.error('写真の取得エラー:', error);
    return;
  }

  console.log(`処理対象の写真: ${photos.length}件`);

  for (const photo of photos) {
    try {
      // 2. Unsplashから画像をダウンロード
      const response = await fetch(photo.storage_key);
      if (!response.ok) {
        throw new Error(`画像のダウンロードに失敗: ${response.statusText}`);
      }

      const imageBuffer = await response.arrayBuffer();
      const imageBlob = new Blob([imageBuffer]);

      // 3. ファイル名を生成（元のURLから拡張子を推測、またはデフォルトでjpg）
      const fileExtension = photo.storage_key.includes('.jpg') ? 'jpg' : 
                           photo.storage_key.includes('.png') ? 'png' : 'jpg';
      const fileName = `${photo.uploader_id}/${photo.album_id}/${photo.id}.${fileExtension}`;

      // 4. Supabase Storageにアップロード
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, imageBlob, {
          contentType: response.headers.get('content-type') || 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.error(`アップロードエラー (${photo.id}):`, uploadError);
        continue;
      }

      // 5. 署名付きURLを取得
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('photos')
        .createSignedUrl(fileName, 3600 * 24 * 365); // 1年間有効

      if (signedUrlError) {
        console.error(`署名付きURL取得エラー (${photo.id}):`, signedUrlError);
        continue;
      }

      // 6. photosテーブルのstorage_keyを更新
      const { error: updateError } = await supabase
        .from('photos')
        .update({ storage_key: fileName })
        .eq('id', photo.id);

      if (updateError) {
        console.error(`更新エラー (${photo.id}):`, updateError);
        continue;
      }

      console.log(`✅ 完了: ${photo.id} -> ${fileName}`);
    } catch (error) {
      console.error(`エラー (${photo.id}):`, error);
    }
  }

  console.log('✅ すべての写真の移行が完了しました');
}

// 実行
migratePhotosToStorage();
```

### 方法2: Supabase Edge Functionsを使用

Supabase Edge Functionsを使用して、サーバー側で画像をダウンロード・アップロードする方法もあります。

### 方法3: 手動でアップロード（少数の場合）

写真が少ない場合は、手動でSupabase Storageにアップロードすることもできます。

1. **Supabaseダッシュボード > Storage > photos** を開く
2. **Upload** ボタンをクリック
3. 画像ファイルをアップロード
4. アップロードしたファイルのパスを`photos`テーブルの`storage_key`に更新

## 現在の状態の確認

以下のSQLで、Unsplash URLを使用している写真を確認できます：

```sql
SELECT 
  p.id,
  p.album_id,
  a.title as album_title,
  p.storage_key,
  CASE 
    WHEN p.storage_key LIKE 'http%' THEN 'Unsplash URL'
    ELSE 'Supabase Storage'
  END as storage_type
FROM public.photos p
LEFT JOIN public.albums a ON p.album_id = a.id
WHERE p.storage_key LIKE 'https://images.unsplash.com%'
ORDER BY p.created_at DESC;
```

## 推奨される手順

1. **重複アルバムの削除**
   - `supabase/sql/cleanup-duplicate-albums.sql` を実行

2. **写真の移行（アプリケーション側で実装）**
   - 上記の方法1を参考に、移行スクリプトを作成・実行

3. **確認**
   - 移行後、Storageにファイルが保存されているか確認
   - アプリケーションで写真が正しく表示されるか確認

## 注意事項

- **サービスロールキー**: Storageへのアップロードには、通常のアノンキーではなく、サービスロールキーが必要な場合があります
- **レート制限**: UnsplashのAPIにはレート制限がある可能性があります
- **ストレージ容量**: 大量の画像をアップロードする場合、Supabaseのストレージ容量を確認してください
- **バックアップ**: 移行前に、現在のデータをバックアップすることを推奨します

