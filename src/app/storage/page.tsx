"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Database } from "lucide-react";
import { Header } from "@/components/Header";
import { Snackbar } from "@/components/ui/snackbar";
import { StorageUsageSection } from "./components/StorageUsageSection";
import { AlbumStorageSection } from "./components/AlbumStorageSection";
import { StorageManagementSection } from "./components/StorageManagementSection";

interface AlbumStorage {
  id: string;
  title: string;
  description: string | null;
  coverImage: string;
  photoCount: number;
  totalSize: number;
  createdAt: string;
  updatedAt: string;
}

const StoragePage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<{
    display_name: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [albums, setAlbums] = useState<AlbumStorage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // プロフィール情報の取得（Header用）
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('user_id', user.id)
          .single();

        if (data) {
          // アバターURLを処理
          let avatarUrl: string | undefined = (data as any).avatar_url || undefined;
          if (avatarUrl && !avatarUrl.startsWith('http') && avatarUrl.startsWith('avatars/')) {
            const { data: signedUrlData } = await supabase.storage
              .from('photos')
              .createSignedUrl(avatarUrl, 3600);
            avatarUrl = signedUrlData?.signedUrl || undefined;
          }

          setProfile({
            display_name: (data as any).display_name || null,
            avatar_url: avatarUrl || null,
          });
        }
      } catch (err) {
        console.error('プロフィール取得エラー:', err);
      }
    };

    fetchProfile();
  }, [user]);

  // アルバム別ストレージ使用量の取得
  useEffect(() => {
    const fetchAlbumsStorage = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // アルバム一覧を取得
        const { data: albumsData, error: albumsError } = await supabase
          .from('albums')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (albumsError) {
          console.error('アルバム取得エラー:', albumsError);
          setMessage({ type: 'error', text: 'アルバムの取得に失敗しました' });
          setLoading(false);
          return;
        }

        // 各アルバムのストレージ使用量を計算
        const albumsWithStorage: AlbumStorage[] = await Promise.all(
          (albumsData || []).map(async (album: any) => {
            // アルバムの写真を取得
            const { data: photosData } = await supabase
              .from('photos')
              .select('storage_key, bytes, created_at')
              .eq('album_id', album.id);

            const photos = (photosData || []) as Array<{ storage_key: string; bytes: number | null; created_at: string }>;

            // ストレージ使用量を計算（bytesカラムがある場合はそれを使用、ない場合は0）
            const totalSize = photos.reduce(
              (sum: number, photo: { storage_key: string; bytes: number | null; created_at: string }) => sum + (photo.bytes || 0),
              0
            );

            // カバー画像を取得
            let coverImage = "https://images.unsplash.com/photo-1587955793432-7c4ff80918ba?w=400";
            if (photos.length > 0) {
              const firstPhoto = photos[0];
              const photoKey = firstPhoto.storage_key;
              if (photoKey?.startsWith('http')) {
                coverImage = photoKey;
              } else if (photoKey) {
                const { data: signedUrl } = await supabase.storage
                  .from('photos')
                  .createSignedUrl(photoKey, 3600);
                if (signedUrl) {
                  coverImage = signedUrl.signedUrl;
                }
              }
            }

            return {
              id: album.id,
              title: album.title,
              description: album.description,
              coverImage,
              photoCount: photos.length,
              totalSize,
              createdAt: album.created_at,
              updatedAt: album.updated_at || album.created_at,
            };
          })
        );

        setAlbums(albumsWithStorage);
      } catch (err) {
        console.error('アルバムストレージ取得エラー:', err);
        setMessage({ type: 'error', text: 'アルバム情報の取得に失敗しました' });
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumsStorage();
  }, [user]);

  // ストレージ使用量の計算
  const usedStorage = albums.reduce((sum, album) => sum + album.totalSize, 0);
  const totalStorage = 5 * 1024 * 1024 * 1024; // 5GB（サンプル、実際の値に置き換え可能）
  const totalFiles = albums.reduce((sum, album) => sum + album.photoCount, 0);
  const averageFileSize = totalFiles > 0 ? usedStorage / totalFiles : 0;

  // アルバム削除
  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm('このアルバムを削除しますか？アルバム内のすべての写真も削除されます。')) {
      return;
    }

    try {
      // アルバムに紐づく写真を取得
      const { data: photos } = await supabase
        .from('photos')
        .select('storage_key')
        .eq('album_id', albumId);

      // ストレージから写真を削除
      if (photos && photos.length > 0) {
        const storageKeys = photos
          .map((p: any) => p.storage_key)
          .filter((key: string) => !key.startsWith('http'));

        if (storageKeys.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('photos')
            .remove(storageKeys);

          if (storageError) {
            console.warn('ストレージ削除エラー（無視）:', storageError);
          }
        }
      }

      // アルバムを削除（カスケード削除で写真も削除される）
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId);

      if (error) {
        console.error('アルバム削除エラー:', error);
        setMessage({ type: 'error', text: 'アルバムの削除に失敗しました' });
        return;
      }

      setMessage({ type: 'success', text: 'アルバムを削除しました' });
      // アルバム一覧を更新
      setAlbums(albums.filter((a) => a.id !== albumId));
    } catch (err) {
      console.error('アルバム削除エラー:', err);
      setMessage({ type: 'error', text: 'アルバムの削除に失敗しました' });
    }
  };

  // ストレージクリーンアップ（未使用ファイルの削除）
  const handleCleanup = async () => {
    setCleaning(true);
    setMessage(null);

    try {
      // データベースに存在する写真のstorage_keyを取得
      const { data: photos } = await supabase
        .from('photos')
        .select('storage_key');

      const usedStorageKeys = new Set(
        (photos || []).map((p: any) => p.storage_key).filter((key: string) => !key.startsWith('http'))
      );

      // ストレージから全ファイルを取得
      const { data: allFiles } = await supabase.storage
        .from('photos')
        .list('', { limit: 10000 });

      if (!allFiles) {
        setMessage({ type: 'success', text: 'クリーンアップするファイルはありませんでした' });
        setCleaning(false);
        return;
      }

      // データベースに存在しないファイルを検出（avatars/は除外）
      const unusedFiles = allFiles
        .filter((file) => {
          const filePath = file.name;
          return !usedStorageKeys.has(filePath) && !filePath.startsWith('avatars/');
        })
        .map((file) => file.name);

      if (unusedFiles.length === 0) {
        setMessage({ type: 'success', text: 'クリーンアップするファイルはありませんでした' });
        setCleaning(false);
        return;
      }

      // 未使用ファイルを削除
      const { error } = await supabase.storage
        .from('photos')
        .remove(unusedFiles);

      if (error) {
        console.error('クリーンアップエラー:', error);
        setMessage({ type: 'error', text: 'クリーンアップに失敗しました' });
        return;
      }

      setMessage({ type: 'success', text: `${unusedFiles.length}件の未使用ファイルを削除しました` });
      // アルバム一覧を再取得
      window.location.reload();
    } catch (err) {
      console.error('クリーンアップエラー:', err);
      setMessage({ type: 'error', text: 'クリーンアップに失敗しました' });
    } finally {
      setCleaning(false);
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header
          user={{
            name: profile?.display_name || user?.email?.split('@')[0] || 'ユーザー',
            email: user?.email || '',
            avatar: profile?.avatar_url || undefined,
          }}
          onLogout={handleLogout}
        />
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ヘッダー */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ストレージ管理
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                アップロードされたファイルを管理・整理
              </p>
            </div>
          </div>

          {/* メッセージ表示 */}
          {/* Snackbarはページ最上部に固定表示されます */}
          {message && (
            <Snackbar
              message={{
                type: message.type,
                title: message.text,
              }}
              onClose={() => setMessage(null)}
              duration={3000}
            />
          )}

          {/* セクション */}
          <div className="space-y-6">
            <StorageUsageSection
              usedStorage={usedStorage}
              totalStorage={totalStorage}
              totalFiles={totalFiles}
              averageFileSize={averageFileSize}
            />

            <AlbumStorageSection
              albums={albums}
              loading={loading}
              totalStorage={totalStorage}
              onDeleteAlbum={handleDeleteAlbum}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            <StorageManagementSection
              selectedFilesCount={0}
              onCleanup={handleCleanup}
              deleting={deleting}
              cleaning={cleaning}
            />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default StoragePage;

