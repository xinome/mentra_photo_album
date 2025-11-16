# 「新しいアルバム」削除ガイド

このガイドでは、Supabaseに存在する「新しいアルバム」を削除する方法を説明します。

## 🔍 問題の概要

現在、Supabaseにタイトルが「新しいアルバム」のアルバムが7件存在しており、これらがアルバム一覧の上位を占めているため、実際のアルバム（「家族旅行 2024 沖縄」など）が表示されない問題が発生しています。

## ⚠️ 注意事項

**重要**: データを削除する前に、必ずSupabaseダッシュボードでバックアップを取ってください。

1. Supabaseダッシュボードにログイン
2. Database > Backups でバックアップを確認・作成
3. または、`albums`テーブルをエクスポート

## 📋 削除手順

### ステップ1: 削除対象の確認

SupabaseダッシュボードのSQL Editorで、以下のクエリを実行して削除対象を確認します：

```sql
SELECT 
  a.id,
  a.title,
  a.owner_id,
  a.created_at,
  COUNT(p.id) as photo_count
FROM public.albums a
LEFT JOIN public.photos p ON p.album_id = a.id
WHERE a.title = '新しいアルバム'
GROUP BY a.id, a.title, a.owner_id, a.created_at
ORDER BY a.created_at DESC;
```

このクエリで、どのアルバムが削除されるか確認できます。

### ステップ2: 削除実行

**警告**: このクエリを実行すると、「新しいアルバム」がすべて削除されます。

```sql
DELETE FROM public.albums
WHERE title = '新しいアルバム';
```

**注意**: CASCADE DELETEにより、アルバムを削除すると関連する写真も自動的に削除されます。

### ステップ3: 削除後の確認

削除後に、確認します：

```sql
SELECT 
  COUNT(*) as remaining_new_albums
FROM public.albums
WHERE title = '新しいアルバム';
```

結果が0なら、すべて削除されました。

### ステップ4: 残っているアルバムの確認

現在のユーザーのアルバム一覧を確認します：

```sql
SELECT 
  a.id,
  a.title,
  a.owner_id,
  a.created_at,
  COUNT(p.id) as photo_count
FROM public.albums a
LEFT JOIN public.photos p ON p.album_id = a.id
WHERE a.owner_id = auth.uid()
GROUP BY a.id, a.title, a.owner_id, a.created_at
ORDER BY a.created_at DESC;
```

## 🔄 完全なスクリプトファイル

すべてのステップを含む完全なスクリプトは、`supabase/sql/delete-new-albums.sql`にあります。

## 🎯 期待される結果

削除後、以下のアルバムが表示されるはずです：

- **家族旅行 2024 沖縄**
- **田中家結婚式**
- **サッカー部春合宿 2024**
- **大学卒業式**

「新しいアルバム」は表示されなくなります。

## 🐛 トラブルシューティング

### エラー: "permission denied for table albums"

RLSポリシーが原因の場合、以下のいずれかを行ってください：

1. **RLSポリシーを一時的に無効化**（開発環境のみ）:
   ```sql
   ALTER TABLE public.albums DISABLE ROW LEVEL SECURITY;
   -- 削除実行
   DELETE FROM public.albums WHERE title = '新しいアルバム';
   ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
   ```

2. **SupabaseダッシュボードのSQL Editorで実行**（サービスロール権限で実行されます）

### 削除したくないアルバムも削除されてしまった場合

バックアップから復元してください：
1. Supabaseダッシュボード > Database > Backups
2. バックアップを選択して復元

## 📝 今後の対策

「新しいアルバム」が自動的に作成されないようにするため：

1. **アルバム作成時のタイトル検証**: タイトルが空の場合、エラーを表示
2. **デフォルトタイトルの改善**: 「新しいアルバム」ではなく、日付ベースのタイトルを使用
3. **テストデータの管理**: テストデータは別の環境で管理

