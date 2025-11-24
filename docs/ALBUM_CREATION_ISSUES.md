# アルバム作成実装の問題点

ALBUM_CREATION_FLOW.mdと現在の実装を比較して特定した問題点です。

## 🔴 発見された問題

### 問題1: `handleCreateAlbum`が直接アルバムを作成している

**現在の実装** (`src/app/albums/page.tsx` 344-374行目):
```tsx
const handleCreateAlbum = async () => {
  if (!user) return;
  
  // ❌ 直接SupabaseにアルバムをINSERTしている
  const { data, error } = await supabase
    .from("albums")
    .insert({ 
      title: "新しいアルバム",  // ← 固定値
      description: "アルバムの説明を追加してください",
      owner_id: user.id 
    })
    .select();

  if (data && data[0]) {
    setAlbums(prev => [newAlbum, ...prev]);
    router.push(`/albums/${data[0].id}`);  // ← 直接詳細ページに遷移
  }
};
```

**期待される実装** (ALBUM_CREATION_FLOW.mdより):
```tsx
const handleCreateAlbum = () => {
  // ✅ 遷移のみを行う
  setCurrentState("creating");  // AlbumCreatorに遷移
  // ❌ ここでアルバムを作成してはいけない
  // ❌ setAlbums() を呼んではいけない
};
```

**問題点**:
- アルバム作成画面（AlbumCreator）に遷移せず、直接アルバムが作成される
- ユーザーがアルバム名やカテゴリを入力する機会がない
- 「新しいアルバム」という固定名で作成される

---

### 問題2: AlbumCreatorコンポーネントが使用されていない

**現在の実装**:
- `src/components/AlbumCreator.tsx`は存在する
- しかし、`src/app/albums/page.tsx`では使用されていない
- 条件分岐で`AlbumCreator`を表示するコードがない

**期待される実装**:
```tsx
// 状態管理
const [currentState, setCurrentState] = useState<"dashboard" | "creating" | "viewing">("dashboard");

// 条件分岐で表示
{currentState === "creating" && (
  <AlbumCreator
    onBack={() => setCurrentState("dashboard")}
    onSave={handleSaveAlbum}
  />
)}
```

---

### 問題3: 状態管理が不足している

**現在の実装**:
- `albums/page.tsx`には状態管理がない
- `creating`や`viewing`の状態がない
- 画面遷移が`router.push`のみで管理されている

**期待される実装**:
```tsx
type AlbumPageState = "dashboard" | "creating" | "viewing";

const [currentState, setCurrentState] = useState<AlbumPageState>("dashboard");
const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
```

---

### 問題4: `handleSaveAlbum`関数が実装されていない

**現在の実装**:
- `handleSaveAlbum`関数が存在しない
- AlbumCreatorから呼ばれるべき保存処理がない

**期待される実装**:
```tsx
const handleSaveAlbum = async (albumData: AlbumData) => {
  // 1. Supabase Storageに写真をアップロード
  // 2. albumsテーブルにアルバム情報を保存
  // 3. photosテーブルに写真情報を保存
  // 4. 状態を更新してアルバム閲覧画面に遷移
  setCurrentState("viewing");
  setSelectedAlbumId(albumId);
};
```

---

## 📋 修正が必要な箇所

### 1. `src/app/albums/page.tsx`

#### 修正1: 状態管理の追加
```tsx
// 追加が必要
type AlbumPageState = "dashboard" | "creating" | "viewing";
const [currentState, setCurrentState] = useState<AlbumPageState>("dashboard");
const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
```

#### 修正2: `handleCreateAlbum`の修正
```tsx
// ❌ 現在（間違い）
const handleCreateAlbum = async () => {
  // 直接アルバムを作成している
  await supabase.from("albums").insert({...});
};

// ✅ 修正後（正しい）
const handleCreateAlbum = () => {
  setCurrentState("creating");  // 遷移のみ
};
```

#### 修正3: `handleSaveAlbum`の実装
```tsx
// 新規実装が必要
const handleSaveAlbum = async (albumData: AlbumData) => {
  // 1. 写真をSupabase Storageにアップロード
  // 2. albumsテーブルに保存
  // 3. photosテーブルに保存
  // 4. 状態を更新
  setCurrentState("viewing");
  setSelectedAlbumId(albumId);
};
```

#### 修正4: 条件分岐の追加
```tsx
// 現在
return (
  <Dashboard
    albums={albums}
    onCreateAlbum={handleCreateAlbum}
    onOpenAlbum={handleOpenAlbum}
  />
);

// 修正後
return (
  <>
    {currentState === "dashboard" && (
      <Dashboard
        albums={albums}
        onCreateAlbum={handleCreateAlbum}
        onOpenAlbum={handleOpenAlbum}
      />
    )}
    
    {currentState === "creating" && (
      <AlbumCreator
        onBack={() => setCurrentState("dashboard")}
        onSave={handleSaveAlbum}
      />
    )}
    
    {currentState === "viewing" && selectedAlbumId && (
      // アルバム詳細ページ（既存の実装を活用）
    )}
  </>
);
```

---

## 🔄 正しいフロー

### 期待される動作フロー

```
1. ダッシュボード表示
   └─ 「新しいアルバムを作成」ボタンが表示される

2. 「新しいアルバムを作成」ボタンをクリック
   └─ handleCreateAlbum() が実行される
   └─ currentState が "creating" に変更される

3. アルバム作成画面（AlbumCreator）に遷移
   └─ アルバム情報入力フォームが表示される
      ├─ アルバム名（必須）
      ├─ カテゴリ（必須）
      ├─ 説明（任意）
      ├─ 公開設定（トグル）
      └─ 写真アップロード（必須）

4. ユーザーが情報を入力
   └─ リアルタイムでバリデーション
   └─ 写真のプレビュー表示

5. 「アルバムを作成」ボタンをクリック
   └─ handleSaveAlbum() が実行される
   └─ Supabaseに保存
   └─ アップロード進捗バーが表示（0→100%）

6. アルバム作成完了
   └─ currentState が "viewing" に変更される
   └─ 新規作成されたアルバムの閲覧画面に遷移
```

---

## ✅ 修正チェックリスト

- [ ] 状態管理を追加（`currentState`, `selectedAlbumId`）
- [ ] `handleCreateAlbum`を遷移のみを行う関数に修正
- [ ] `handleSaveAlbum`関数を実装（Supabase統合）
- [ ] 条件分岐を追加（`dashboard` / `creating` / `viewing`）
- [ ] AlbumCreatorコンポーネントをインポートして使用
- [ ] アルバム作成後の遷移処理を実装

---

## 📚 参考

- [ALBUM_CREATION_FLOW.md](../ALBUM_CREATION_FLOW.md) - 詳細な実装仕様
- `src/components/AlbumCreator.tsx` - 既存のAlbumCreatorコンポーネント
- `src/app/App.tsx` - 参考実装（モック版）

