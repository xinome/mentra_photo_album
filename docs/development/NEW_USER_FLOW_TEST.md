# 新規ユーザーフロー検証ガイド

## 実装内容

新規ユーザーが初めてログインした際に、プロフィール設定画面を表示するフローを実装しました。

### フロー概要

```
1. Magic Linkログイン
   ↓
2. メール受信・リンククリック
   ↓
3. /albums にリダイレクト
   ↓
4. プロフィールチェック
   ├─ プロフィール未設定 → /account/setup にリダイレクト
   └─ プロフィール設定済み → アルバムページ表示
```

## 検証手順

### 準備：既存のプロフィールを削除

既にアカウントを作成している場合は、プロフィールを削除して新規ユーザーとして検証します。

#### 方法1: Supabaseダッシュボードから削除

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. プロジェクトを選択
3. **Table Editor** > **profiles** テーブルを開く
4. 自分のユーザーIDの行を見つけて削除

#### 方法2: SQLで削除

Supabase Dashboard > **SQL Editor** で以下を実行：

```sql
-- 自分のメールアドレスに対応するプロフィールを削除
DELETE FROM profiles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);
```

### テストケース1: 新規ユーザー登録

**目的**: 初回ログイン時にプロフィール設定画面が表示されることを確認

**手順**:
1. ログインページ（`http://localhost:3000/login`）にアクセス
2. 新しいメールアドレスを入力してMagic Link送信
3. メールを確認してリンクをクリック
4. **期待結果**: `/account/setup`（プロフィール設定ページ）にリダイレクトされる

**確認ポイント**:
- ✅ プロフィール設定画面が表示される
- ✅ 表示名、アバター、自己紹介の入力欄がある
- ✅ 「スキップ」ボタンがある

### テストケース2: プロフィール設定完了

**目的**: プロフィール設定後にアルバムページに遷移することを確認

**手順**:
1. テストケース1の続きから、プロフィール設定画面で以下を入力：
   - 表示名: 「テストユーザー」
   - 利用規約に同意（チェックボックス）
2. 「プロフィールを完了」ボタンをクリック
3. **期待結果**: `/albums`（アルバム一覧ページ）にリダイレクトされる

**確認ポイント**:
- ✅ アルバム一覧ページが表示される
- ✅ ヘッダーに設定した表示名が表示される
- ✅ Supabaseの`profiles`テーブルにレコードが作成されている

**データベース確認**:
```sql
SELECT * FROM profiles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'your-test-email@example.com'
);
```

### テストケース3: 既存ユーザーのログイン

**目的**: 既にプロフィールを設定済みのユーザーは直接アルバムページに遷移することを確認

**手順**:
1. ログアウト（ヘッダーのドロップダウンメニューから）
2. 再度ログインページにアクセス
3. テストケース2で使用したメールアドレスでMagic Link送信
4. メールのリンクをクリック
5. **期待結果**: `/albums`に直接リダイレクトされ、プロフィール設定画面をスキップ

**確認ポイント**:
- ✅ プロフィール設定画面が表示されない
- ✅ アルバム一覧ページに直接遷移
- ✅ 設定済みの表示名がヘッダーに表示される

### テストケース4: プロフィール設定のスキップ

**目的**: スキップボタンでもアルバムページに遷移できることを確認

**手順**:
1. 新しいメールアドレスで新規ユーザーとしてログイン
2. プロフィール設定画面が表示されたら「後で設定する」ボタンをクリック
3. **期待結果**: `/albums`にリダイレクトされる

**確認ポイント**:
- ✅ アルバム一覧ページに遷移
- ✅ ヘッダーにデフォルトの表示名（メールアドレスの@前部分）が表示される

### テストケース5: プロフィール設定画面への直接アクセス

**目的**: 既にプロフィール設定済みのユーザーが設定画面にアクセスした場合の動作確認

**手順**:
1. プロフィール設定済みのユーザーでログイン
2. ブラウザのアドレスバーに直接 `http://localhost:3000/account/setup` を入力
3. **期待結果**: `/albums`にリダイレクトされる

**確認ポイント**:
- ✅ プロフィール設定画面が表示されない
- ✅ アルバムページに自動的にリダイレクトされる

## デバッグ方法

### ブラウザのコンソールを確認

開発者ツール（F12）のConsoleタブで以下のログを確認：

```
AlbumsPage: プロフィールチェック開始
AlbumsPage: プロフィール確認結果 { profile: null/object, error: ... }
```

- `profile: null` → 新規ユーザー、プロフィール設定へリダイレクト
- `profile: { display_name: null }` → プロフィール未完了、設定へリダイレクト
- `profile: { display_name: "名前" }` → 既存ユーザー、アルバムページ表示

### データベースの直接確認

Supabase Dashboard > **Table Editor**で以下を確認：

1. **auth.users** テーブル: ユーザーが作成されているか
2. **profiles** テーブル: プロフィールが作成されているか

## トラブルシューティング

### プロフィール設定画面が表示されない

**原因**: 既にプロフィールが設定されている

**解決方法**: 
1. 準備手順でプロフィールを削除
2. ブラウザのキャッシュをクリア
3. シークレット/プライベートウィンドウで試す

### 無限リダイレクトループ

**原因**: プロフィールの作成に失敗している

**解決方法**:
1. ブラウザのコンソールでエラーを確認
2. Supabaseのプロフィールテーブルの権限（RLS）を確認
3. ネットワークタブでAPI呼び出しを確認

### Magic Linkが届かない

**原因**: メール送信の設定問題

**解決方法**:
1. Supabase Dashboard > **Authentication** > **Email Templates**を確認
2. ローカルSupabase使用時は Inbucket（`http://localhost:54324`）を確認
3. リモートSupabaseの場合、迷惑メールフォルダを確認

## 実装詳細

### 関連ファイル

- `/src/app/account/setup/page.tsx` - プロフィール設定ページ
- `/src/app/albums/page.tsx` - アルバムページ（プロフィールチェック処理）
- `/src/components/ProfileSetup.tsx` - プロフィール設定コンポーネント
- `/src/components/AuthProvider.tsx` - 認証状態管理
- `/src/components/AuthGuard.tsx` - 認証ガード

### プロフィールチェックロジック

```typescript
// /albums ページでの処理
useEffect(() => {
  const checkProfile = async () => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // プロフィールが存在しないか、display_nameが設定されていない場合
    if (!profile || !profile.display_name) {
      router.push("/account/setup");
      return;
    }

    setProfileChecked(true);
  };

  if (user) {
    checkProfile();
  }
}, [user, router]);
```

## 参考情報

- [Figmaデザイン](https://www.figma.com/design/lPbJ0bzsWg0JfjucWuuoXu/Mantra-Photo-Album?node-id=0-1&t=7ioFSvQtABZ1m2Jx-1)
- [Supabase認証ドキュメント](https://supabase.com/docs/guides/auth)
- [Next.js App Router](https://nextjs.org/docs/app)

