# 重複データのクリーンアップガイド

このガイドでは、Supabaseの`photos`テーブルにある重複データをクリーンアップする方法を説明します。

## 🔍 問題の概要

現在、同じアルバムIDと`storage_key`を持つ写真が複数回挿入されており、重複データが存在しています。これは、サンプルデータスクリプトが複数回実行された可能性があります。

## ⚠️ 注意事項

**重要**: データを削除する前に、必ずSupabaseダッシュボードでバックアップを取ってください。

1. Supabaseダッシュボードにログイン
2. Database > Backups でバックアップを確認・作成
3. または、`photos`テーブルをエクスポート

## 📋 クリーンアップ手順

### ステップ1: 重複データの確認

SupabaseダッシュボードのSQL Editorで、以下のクエリを実行して重複データを確認します：

```sql
SELECT 
  album_id,
  storage_key,
  COUNT(*) as duplicate_count,
  MIN(created_at) as oldest_created_at,
  MAX(created_at) as newest_created_at
FROM public.photos
GROUP BY album_id, storage_key
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, album_id;
```

このクエリで、どのアルバムにどのくらいの重複があるか確認できます。

### ステップ2: 削除対象の確認（実際には削除しません）

以下のクエリで、削除される行を確認します：

```sql
WITH duplicates AS (
  SELECT 
    id,
    album_id,
    storage_key,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY album_id, storage_key 
      ORDER BY created_at ASC
    ) as row_num
  FROM public.photos
)
SELECT 
  d.*,
  a.title as album_title
FROM duplicates d
JOIN public.albums a ON a.id = d.album_id
WHERE d.row_num > 1
ORDER BY d.album_id, d.storage_key, d.created_at;
```

このクエリは削除を実行しません。削除される行の内容を確認できます。

### ステップ3: 重複データの削除

**警告**: このクエリを実行すると、重複データが削除されます。

同じアルバムID + storage_keyの組み合わせで、最も古い`created_at`の1件のみを残し、それ以外を削除します：

```sql
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY album_id, storage_key 
      ORDER BY created_at ASC
    ) as row_num
  FROM public.photos
)
DELETE FROM public.photos
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);
```

### ステップ4: 削除後の確認

削除後に、重複がなくなったことを確認します：

```sql
SELECT 
  album_id,
  storage_key,
  COUNT(*) as count
FROM public.photos
GROUP BY album_id, storage_key
HAVING COUNT(*) > 1;
```

結果が0行なら、重複はありません。

### ステップ5: アルバムごとの写真数確認

各アルバムの写真数を確認します：

```sql
SELECT 
  a.id as album_id,
  a.title as album_title,
  COUNT(p.id) as photo_count
FROM public.albums a
LEFT JOIN public.photos p ON p.album_id = a.id
WHERE a.owner_id = auth.uid()
GROUP BY a.id, a.title
ORDER BY a.title;
```

## 🔄 完全なスクリプトファイル

すべてのステップを含む完全なスクリプトは、`supabase/sql/cleanup-duplicate-photos.sql`にあります。

## 🎯 期待される結果

クリーンアップ後、各アルバムの写真数は以下のようになるはずです：

- **家族旅行 2024 沖縄**: 6件
- **田中家結婚式**: 8件
- **サッカー部春合宿 2024**: 6件
- **大学卒業式**: 7件

合計: 27件（サンプルデータのコメントより）

## 🐛 トラブルシューティング

### エラー: "permission denied for table photos"

RLSポリシーが原因の場合、以下のいずれかを行ってください：

1. **RLSポリシーを一時的に無効化**（開発環境のみ）:
   ```sql
   ALTER TABLE public.photos DISABLE ROW LEVEL SECURITY;
   -- クリーンアップ実行
   ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
   ```

2. **SupabaseダッシュボードのSQL Editorで実行**（サービスロール権限で実行されます）

### 削除したくないデータも削除されてしまった場合

バックアップから復元してください：
1. Supabaseダッシュボード > Database > Backups
2. バックアップを選択して復元

## 📝 今後の対策

重複データを防ぐために、以下の対策を検討してください：

1. **一意制約の追加**:
   ```sql
   CREATE UNIQUE INDEX idx_photos_album_storage 
   ON public.photos(album_id, storage_key);
   ```

2. **INSERT時の重複チェック**:
   - アプリケーション側で、INSERT前に既存データを確認
   - または、`ON CONFLICT`句を使用（上記の一意制約が必要）

3. **サンプルデータスクリプトの実行制限**:
   - 一度しか実行できないようにする
   - または、実行前に既存データを削除

