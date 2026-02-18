# Supabase RLSポリシー コード例（note記事用）

本リポジトリ（mentra_photo_album）で使用している Supabase RLS（Row Level Security）のポリシー例を、記事用に抜粋したものです。

---

## 1. RLSの有効化と基本パターン

テーブルごとに `ENABLE ROW LEVEL SECURITY` を実行し、その後 `CREATE POLICY` でポリシーを定義します。

```sql
-- RLS有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 既存ポリシーを削除してから再作成（冪等にする場合）
DROP POLICY IF EXISTS profiles_select ON public.profiles;
DROP POLICY IF EXISTS profiles_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_update ON public.profiles;
DROP POLICY IF EXISTS profiles_delete ON public.profiles;
```

---

## 2. プロフィールテーブル（公開読み取り + 自分だけ編集）

- **SELECT**: 全員が読み取り可能（`USING (true)`）
- **INSERT/UPDATE/DELETE**: `user_id = auth.uid()` の行だけ操作可能

```sql
CREATE POLICY profiles_select ON public.profiles
FOR SELECT USING (true);  -- 全員が読み取り可能（プロフィールは公開情報）

CREATE POLICY profiles_insert ON public.profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY profiles_update ON public.profiles
FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY profiles_delete ON public.profiles
FOR DELETE USING (user_id = auth.uid());
```

---

## 3. アルバムテーブル（オーナー + 公開アルバム）

- **SELECT**: オーナー本人 **または** 公開アルバム（`is_public = true`）のみ
- **INSERT/UPDATE/DELETE**: オーナー本人のみ

```sql
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY albums_select ON public.albums
FOR SELECT USING (
  owner_id = auth.uid() OR 
  is_public = true
);

CREATE POLICY albums_insert ON public.albums
FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY albums_update ON public.albums
FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY albums_delete ON public.albums
FOR DELETE USING (owner_id = auth.uid());
```

---

## 4. 写真テーブル（親テーブル `albums` を参照）

写真は「アルバムに属する」ため、**サブクエリで `albums` を参照**して権限を判定します。

- **SELECT**: オーナーのアルバム **または** 公開アルバムに属する写真のみ
- **INSERT**: オーナーのアルバムにのみ追加可能
- **UPDATE**: アップローダー本人のみ
- **DELETE**: アップローダー本人 **または** アルバムオーナー

```sql
CREATE POLICY photos_select ON public.photos
FOR SELECT USING (
  album_id IN (
    SELECT id FROM public.albums 
    WHERE owner_id = auth.uid() OR is_public = true
  )
);

CREATE POLICY photos_insert ON public.photos
FOR INSERT WITH CHECK (
  album_id IN (
    SELECT id FROM public.albums WHERE owner_id = auth.uid()
  )
);

CREATE POLICY photos_update ON public.photos
FOR UPDATE USING (uploader_id = auth.uid()) WITH CHECK (uploader_id = auth.uid());

CREATE POLICY photos_delete ON public.photos
FOR DELETE USING (
  uploader_id = auth.uid() OR
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);
```

---

## 5. コメントテーブル（写真 → アルバムの2段サブクエリ）

コメントは「写真に紐づき、写真はアルバムに属する」ため、**2段のサブクエリ**でアクセス可能な写真だけに限定します。

```sql
CREATE POLICY comments_select ON public.comments
FOR SELECT USING (
  photo_id IN (
    SELECT id FROM public.photos
    WHERE album_id IN (
      SELECT id FROM public.albums 
      WHERE owner_id = auth.uid() OR is_public = true
    )
  )
);

CREATE POLICY comments_insert ON public.comments
FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY comments_delete ON public.comments
FOR DELETE USING (author_id = auth.uid());
```

---

## 6. 共有（shares）テーブル（オーナーのアルバムのみ）

共有設定はアルバムオーナーだけが操作できるようにします。

```sql
CREATE POLICY shares_select ON public.shares
FOR SELECT USING (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

CREATE POLICY shares_insert ON public.shares
FOR INSERT WITH CHECK (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

CREATE POLICY shares_update ON public.shares
FOR UPDATE USING (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
) WITH CHECK (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);

CREATE POLICY shares_delete ON public.shares
FOR DELETE USING (
  album_id IN (SELECT id FROM public.albums WHERE owner_id = auth.uid())
);
```

---

## 7. Storage（storage.objects）のRLS

Supabase Storage のオブジェクトにも RLS を設定します。`bucket_id` と `auth.role()` で認証済みユーザーのみ操作可能にしています。

```sql
-- 認証済みユーザーが写真をアップロード可能
CREATE POLICY "Users can upload photos" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

-- 認証済みユーザーが写真を閲覧可能
CREATE POLICY "Users can view photos" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

-- 認証済みユーザーが自分の写真を更新・削除可能
CREATE POLICY "Users can update own photos" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete own photos" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);
```

---

## ポイントまとめ

| パターン | 例 | 説明 |
|----------|-----|------|
| `auth.uid()` | `user_id = auth.uid()` | ログインユーザーのIDと一致する行のみ |
| `USING` / `WITH CHECK` | UPDATE で両方指定 | USING: 既存行の条件、WITH CHECK: 変更後の行の条件 |
| サブクエリで親テーブル参照 | `photos_select` | 親（albums）の権限で子（photos）の可視範囲を制御 |
| 公開 + オーナー | `albums_select` | `owner_id = auth.uid() OR is_public = true` |
| Storage | `storage.objects` | `bucket_id` と `auth.role() = 'authenticated'` で制限 |

元の定義ファイル: `supabase/sql/02-rls-policies.sql`、Storage は `supabase/sql/complete-setup.sql` 内のストレージRLS部分。
