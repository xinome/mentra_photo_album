# データベーステーブル構造

## テーブル一覧

### 1. profiles（プロフィール）

ユーザーのプロフィール情報を保存

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| user_id | uuid | NO | - | ユーザーID（主キー、auth.usersへの外部キー） |
| display_name | text | YES | NULL | 表示名 |
| avatar_url | text | YES | NULL | アバター画像のURL |
| bio | text | YES | NULL | 自己紹介 |
| created_at | timestamptz | NO | now() | 作成日時 |
| updated_at | timestamptz | NO | now() | 更新日時 |

**制約**:
- PRIMARY KEY: user_id
- FOREIGN KEY: user_id → auth.users(id) ON DELETE CASCADE

**インデックス**:
- なし（主キーのみ）

**サンプルデータ**:
```csv
user_id,display_name,avatar_url,bio,created_at,updated_at
a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d,山田太郎,https://example.com/avatar1.jpg,写真が好きです,2024-01-01 00:00:00+00,2024-01-01 00:00:00+00
b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e,佐藤花子,https://example.com/avatar2.jpg,旅行の思い出を記録しています,2024-01-02 00:00:00+00,2024-01-02 00:00:00+00
```

---

### 2. albums（アルバム）

写真アルバムの情報を保存

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| id | uuid | NO | gen_random_uuid() | アルバムID（主キー） |
| owner_id | uuid | NO | - | オーナーのユーザーID |
| title | text | NO | - | アルバムのタイトル |
| description | text | YES | NULL | アルバムの説明 |
| cover_photo_id | uuid | YES | NULL | カバー写真のID |
| is_public | boolean | NO | false | 公開フラグ |
| created_at | timestamptz | NO | now() | 作成日時 |
| updated_at | timestamptz | NO | now() | 更新日時 |

**制約**:
- PRIMARY KEY: id
- FOREIGN KEY: owner_id → auth.users(id) ON DELETE CASCADE

**インデックス**:
- なし（主キーのみ）

**サンプルデータ**:
```csv
id,owner_id,title,description,cover_photo_id,is_public,created_at,updated_at
11111111-1111-1111-1111-111111111111,a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d,家族旅行 2024,沖縄旅行の思い出,,false,2024-01-10 00:00:00+00,2024-01-10 00:00:00+00
22222222-2222-2222-2222-222222222222,a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d,結婚式,田中家の結婚式,,true,2024-02-14 00:00:00+00,2024-02-14 00:00:00+00
33333333-3333-3333-3333-333333333333,b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e,サッカー部合宿,春合宿の思い出,,false,2024-03-20 00:00:00+00,2024-03-20 00:00:00+00
```

---

### 3. photos（写真）

アップロードされた写真の情報を保存

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| id | uuid | NO | gen_random_uuid() | 写真ID（主キー） |
| uploader_id | uuid | NO | - | アップロード者のユーザーID |
| album_id | uuid | NO | - | アルバムID |
| storage_key | text | NO | - | ストレージのパス |
| mime_type | text | YES | NULL | MIMEタイプ（例: image/jpeg） |
| width | int | YES | NULL | 画像の幅（ピクセル） |
| height | int | YES | NULL | 画像の高さ（ピクセル） |
| bytes | int | YES | NULL | ファイルサイズ（バイト） |
| exif | jsonb | YES | NULL | EXIF情報（JSON） |
| caption | text | YES | NULL | キャプション |
| created_at | timestamptz | NO | now() | アップロード日時 |

**制約**:
- PRIMARY KEY: id
- FOREIGN KEY: uploader_id → auth.users(id) ON DELETE CASCADE
- FOREIGN KEY: album_id → albums(id) ON DELETE CASCADE

**インデックス**:
- idx_photos_album: album_id
- idx_photos_created: created_at DESC

**サンプルデータ**:
```csv
id,uploader_id,album_id,storage_key,mime_type,width,height,bytes,exif,caption,created_at
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d,11111111-1111-1111-1111-111111111111,albums/11111111-1111-1111-1111-111111111111/photo1.jpg,image/jpeg,1920,1080,256000,"{""camera"":""iPhone 14 Pro""}",ビーチでの一枚,2024-01-10 10:00:00+00
bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb,a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d,11111111-1111-1111-1111-111111111111,albums/11111111-1111-1111-1111-111111111111/photo2.jpg,image/jpeg,1920,1080,245000,,夕日が綺麗でした,2024-01-10 18:00:00+00
```

---

### 4. album_members（アルバムメンバー）

アルバムへのアクセス権限を管理

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| album_id | uuid | NO | - | アルバムID（複合主キー） |
| user_id | uuid | NO | - | ユーザーID（複合主キー） |
| role | text | NO | - | 役割（owner/editor/viewer） |
| invited_at | timestamptz | NO | now() | 招待日時 |
| joined_at | timestamptz | YES | NULL | 参加日時 |

**制約**:
- PRIMARY KEY: (album_id, user_id)
- FOREIGN KEY: album_id → albums(id) ON DELETE CASCADE
- FOREIGN KEY: user_id → auth.users(id) ON DELETE CASCADE
- CHECK: role IN ('owner', 'editor', 'viewer')

**インデックス**:
- idx_album_members_user: user_id

**サンプルデータ**:
```csv
album_id,user_id,role,invited_at,joined_at
22222222-2222-2222-2222-222222222222,b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e,viewer,2024-02-14 12:00:00+00,2024-02-14 13:00:00+00
```

---

### 5. shares（共有リンク）

アルバムの共有リンクを管理

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| id | uuid | NO | gen_random_uuid() | 共有リンクID（主キー） |
| album_id | uuid | NO | - | アルバムID |
| token | text | NO | - | 共有トークン（一意） |
| permission | text | NO | - | 権限（viewer/editor） |
| expires_at | timestamptz | YES | NULL | 有効期限 |
| disabled | boolean | NO | false | 無効化フラグ |
| created_at | timestamptz | NO | now() | 作成日時 |

**制約**:
- PRIMARY KEY: id
- FOREIGN KEY: album_id → albums(id) ON DELETE CASCADE
- UNIQUE: token
- CHECK: permission IN ('viewer', 'editor')

**インデックス**:
- idx_shares_token: token

**サンプルデータ**:
```csv
id,album_id,token,permission,expires_at,disabled,created_at
55555555-5555-5555-5555-555555555555,22222222-2222-2222-2222-222222222222,abc123def456,viewer,,false,2024-02-15 00:00:00+00
```

---

### 6. comments（コメント）

写真へのコメントを保存

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| id | uuid | NO | gen_random_uuid() | コメントID（主キー） |
| photo_id | uuid | NO | - | 写真ID |
| author_id | uuid | NO | - | 投稿者のユーザーID |
| body | text | NO | - | コメント本文 |
| created_at | timestamptz | NO | now() | 投稿日時 |

**制約**:
- PRIMARY KEY: id
- FOREIGN KEY: photo_id → photos(id) ON DELETE CASCADE
- FOREIGN KEY: author_id → auth.users(id) ON DELETE CASCADE

**インデックス**:
- idx_comments_photo: photo_id

**サンプルデータ**:
```csv
id,photo_id,author_id,body,created_at
66666666-6666-6666-6666-666666666666,aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e,素敵な写真ですね！,2024-01-11 10:00:00+00
```

---

### 7. photo_tags（写真タグ）

写真に付けられたタグを保存

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| photo_id | uuid | NO | - | 写真ID（複合主キー） |
| tag | text | NO | - | タグ名（複合主キー） |

**制約**:
- PRIMARY KEY: (photo_id, tag)
- FOREIGN KEY: photo_id → photos(id) ON DELETE CASCADE

**インデックス**:
- なし（主キーのみ）

**サンプルデータ**:
```csv
photo_id,tag
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,ビーチ
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,沖縄
bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb,夕日
```

---

## ER図（概念図）

```
auth.users
    ↓ (1:1)
profiles

auth.users
    ↓ (1:N)
albums
    ↓ (1:N)
photos
    ↓ (1:N)
comments

albums ←→ (N:M) ←→ auth.users
    (album_members経由)

albums
    ↓ (1:N)
shares

photos
    ↓ (1:N)
photo_tags
```

## データ投入の順序

サンプルデータを投入する際は、外部キー制約を考慮して以下の順序で投入してください：

1. **auth.users** - Supabaseが自動作成（ログイン時）
2. **profiles** - ユーザー作成後
3. **albums** - プロフィール作成後
4. **photos** - アルバム作成後
5. **album_members** - アルバムと他のユーザーが存在
6. **shares** - アルバム作成後
7. **comments** - 写真作成後
8. **photo_tags** - 写真作成後

## RLSポリシーの概要

すべてのテーブルでRow Level Security（RLS）が有効化されており、以下のような権限設定になっています：

- **profiles**: 自分のプロフィールのみアクセス可能
- **albums**: 自分が所有するアルバムまたは共有されているアルバムにアクセス可能
- **photos**: アルバムにアクセス可能なユーザーが写真にもアクセス可能
- **shares**: アルバムのオーナーのみ管理可能
- **comments**: 写真にアクセス可能なユーザーがコメントを閲覧可能

詳細は `complete-setup.sql` を参照してください。

