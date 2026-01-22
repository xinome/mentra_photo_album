"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AlbumViewer } from "@/components/AlbumViewer";
import { Header } from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
import { getCategoryDefaultImage } from "@/lib/category-images";
import { PhotoUploadSection, PhotoUploadData } from "./components/PhotoUploadSection";
import { PhotoManagementSection } from "./components/PhotoManagementSection";
import { PhotoSnackbar } from "./components/PhotoSnackbar";

interface DbPhoto {
  id: string;
  storage_key: string;
  caption: string | null;
  created_at: string;
}

interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  title?: string;
  uploadedBy: {
    name: string;
    avatar?: string;
  };
  uploadedAt: string;
  likes: number;
  isLiked: boolean;
  uploaderId?: string; // 追加：投稿者ID
}

interface Album {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  photos: Photo[];
  createdAt: string;
  category: "wedding" | "event" | "family" | "sports" | "other";
  isShared: boolean;
  contributors: Array<{
    name: string;
    avatar?: string;
  }>;
}

const AlbumDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const id = params.id as string;
  
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [deletingAlbum, setDeletingAlbum] = useState(false); // 追加：アルバム削除中フラグ
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<{ type: 'success' | 'error', title: string, description?: string } | null>(null);

  // URLパラメータを確認して編集完了メッセージを表示
  useEffect(() => {
    const updated = searchParams.get('updated');
    if (updated === 'true') {
      // 編集完了メッセージを表示
      setSnackbarMessage({
        type: 'success',
        title: '変更しました',
        description: 'アルバムの情報を正常に更新しました',
      });
      
      // URLパラメータを削除（リロード時に再度表示されないようにする）
      const url = new URL(window.location.href);
      url.searchParams.delete('updated');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    const fetchAlbumData = async () => {
      if (!id) return;

      // アルバム情報を取得
      const { data: albumData, error: albumError } = await supabase
        .from("albums")
        .select("*")
        .eq("id", id)
        .single();

      if (albumError || !albumData) {
        console.error("アルバム取得エラー:", albumError);
        setLoading(false);
        return;
      }

      // 作成者かどうかを確認
      const album = albumData as any;
      setIsOwner(album.owner_id === user?.id);

      // 写真を取得（アイキャッチ画像を除外）
      const { data: photosData, error: photosError } = await supabase
        .from("photos")
        .select("id,storage_key,caption,exif,created_at,uploader_id") // uploader_idを追加
        .eq("album_id", id)
        .order("created_at");

      console.log("写真取得結果:", { photosData, photosError });

      // アイキャッチ画像（cover_photo_id）を除外
      const filteredPhotosData = (photosData || []).filter(
        (photo: DbPhoto) => photo.id !== album.cover_photo_id
      );

      // 各写真のURLを取得
      const photos: Photo[] = await Promise.all(
        filteredPhotosData.map(async (photo: DbPhoto) => {
          let photoUrl = "";
          const photoData = photo as any;
          
          // storage_keyがURLの場合は直接使用、それ以外はStorageから取得
          if (photoData.storage_key?.startsWith('http')) {
            photoUrl = photoData.storage_key;
          } else if (photoData.storage_key) {
            const { data: signedUrl } = await supabase.storage
              .from("photos")
              .createSignedUrl(photoData.storage_key, 3600);
            photoUrl = signedUrl?.signedUrl || "";
          }

          return {
            id: photo.id,
            url: photoUrl,
            thumbnail: photoUrl,
            title: photo.caption || undefined,
            uploadedBy: {
              name: user?.email?.split("@")[0] || "ユーザー",
            },
            uploadedAt: photo.created_at,
            likes: 0,
            isLiked: false,
            uploaderId: (photoData as any).uploader_id, // 追加
          };
        })
      );

      // カバー画像を取得
      let coverImage: string;
      
      // カバー画像が設定されている場合はそれを取得
      if (album.cover_photo_id) {
        const { data: coverPhoto } = await supabase
          .from("photos")
          .select("storage_key")
          .eq("id", album.cover_photo_id)
          .single();

        if (coverPhoto && (coverPhoto as any).storage_key) {
          const storageKey = (coverPhoto as any).storage_key;
          if (storageKey.startsWith('http')) {
            coverImage = storageKey;
          } else {
            const { data: signedUrl } = await supabase.storage
              .from("photos")
              .createSignedUrl(storageKey, 3600);
            coverImage = signedUrl?.signedUrl || getCategoryDefaultImage(album.category);
          }
        } else {
          // カバー画像が取得できない場合はカテゴリのデフォルト画像を使用
          coverImage = getCategoryDefaultImage(album.category);
        }
      } else if (photos.length > 0) {
        // カバー画像が設定されていない場合は最初の写真を使用
        coverImage = photos[0].url;
      } else {
        // 写真もない場合はカテゴリのデフォルト画像を使用
        coverImage = getCategoryDefaultImage(album.category);
      }

      setAlbum({
        id: album.id,
        title: album.title,
        description: album.description || "アルバムの説明",
        coverImage,
        photos,
        createdAt: album.created_at || album.updated_at,
        category: (album.category as 'wedding' | 'event' | 'family' | 'sports' | 'other') || 'other',
        isShared: album.is_public || false,
        contributors: [
          {
            name: user?.email?.split("@")[0] || "ユーザー",
          },
        ],
      });

      setLoading(false);
    };

    fetchAlbumData();
  }, [id, user]);

  const handleBack = () => {
    router.push("/albums");
  };

  const handleShare = async () => {
    // 共有機能は今後実装予定です
    alert("共有機能は今後実装予定です。\n今後のアップデートで順次実装いたします。");
    
    // TODO: 共有機能の実装（今後実装予定）
    // 以下の実装はイメージ通りのプレビューができないため、一旦コメントアウト
    /*
    if (!id) return;
    
    // 共有トークンを生成
    const token = crypto.randomUUID().replace(/-/g, "");
    const { error } = await supabase
      .from("shares")
      .insert({ album_id: id, token, permission: "viewer" } as any);

    if (!error) {
      const shareUrl = `${window.location.origin}/share/${token}`;
      await navigator.clipboard.writeText(shareUrl);
      alert(`共有リンクをコピーしました！\n${shareUrl}`);
    } else {
      console.error("共有リンク作成エラー:", error);
      alert("共有リンクの作成に失敗しました");
    }
    */
  };

  const handleDownload = () => {
    alert("アルバムダウンロード機能は今後実装予定です。");
  };

  const handleLikePhoto = (photoId: string) => {
    console.log("いいね:", photoId);
    alert("いいね機能は今後実装予定です。");
  };

  const handleEdit = () => {
    router.push(`/albums/${id}/edit`);
  };

  // アルバム削除機能
  const handleAlbumDelete = async () => {
    if (!user || !id) return;

    setDeletingAlbum(true);
    setMessage(null);

    try {
      // 権限チェック：作成者本人のみ削除可能
      if (!isOwner) {
        throw new Error("このアルバムを削除する権限がありません");
      }

      // アルバムに紐づく写真を取得
      const { data: photos } = await supabase
        .from('photos')
        .select('storage_key')
        .eq('album_id', id);

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
        .eq('id', id);

      if (error) {
        throw new Error('アルバムの削除に失敗しました');
      }

      // Snackbarで成功メッセージを表示
      setSnackbarMessage({
        type: 'success',
        title: 'アルバムを削除しました',
        description: 'アルバムが正常に削除されました',
      });

      // アルバム一覧ページにリダイレクト
      setTimeout(() => {
        router.push('/albums');
      }, 1000);
    } catch (err: any) {
      console.error("アルバム削除エラー:", err);
      const errorMessage = err.message || 'アルバムの削除に失敗しました';
      
      // Snackbarでエラーメッセージを表示
      setSnackbarMessage({
        type: 'error',
        title: '削除に失敗しました',
        description: errorMessage,
      });
    } finally {
      setDeletingAlbum(false);
    }
  };

  // 写真追加機能
  const handlePhotoUpload = async (photos: Array<{ file: File; title: string; takenAt: Date | null; description: string }>) => {
    if (!user || !id || photos.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const baseTimestamp = Date.now();
      const uploadedPhotos: Array<{ storageKey: string; photoId: string }> = [];

      // 写真をアップロード
      for (let i = 0; i < photos.length; i++) {
        const photoData = photos[i];
        const file = photoData.file;
        const originalName = file.name;
        const fileExtension = originalName.substring(originalName.lastIndexOf('.'));
        const sanitizedName = originalName
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .substring(0, 50) + fileExtension;

        const randomSuffix = Math.random().toString(36).substring(2, 9);
        const fileName = `${user.id}/${baseTimestamp}-${randomSuffix}-${i}-${sanitizedName}`;

        // Storageにアップロード
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("photos")
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`写真アップロードエラー:`, uploadError);
          throw new Error(`写真のアップロードに失敗しました: ${uploadError.message}`);
        }

        // photosテーブルにレコード追加（タイトル、撮影日、説明を含む）
        const insertData: any = {
          album_id: id,
          uploader_id: user.id,
          storage_key: fileName,
          mime_type: file.type,
          bytes: file.size,
        };

        // タイトル（captionカラムに保存）
        if (photoData.title) {
          insertData.caption = photoData.title;
        }

        // 撮影日と説明をexif jsonbに保存
        const exifData: any = {};
        if (photoData.takenAt) {
          exifData.taken_at = photoData.takenAt.toISOString();
        }
        if (photoData.description) {
          exifData.description = photoData.description;
        }
        if (Object.keys(exifData).length > 0) {
          insertData.exif = exifData;
        }

        const { data: photoRecord, error: photoError } = await supabase
          .from("photos")
          .insert(insertData)
          .select()
          .single();

        if (photoError) {
          console.error("写真レコード作成エラー:", photoError);
          // アップロードしたファイルを削除
          await supabase.storage.from("photos").remove([fileName]);
          throw new Error(`写真情報の保存に失敗しました: ${photoError.message}`);
        }

        uploadedPhotos.push({
          storageKey: fileName,
          photoId: (photoRecord as any).id,
        });

        // 進捗を更新
        setUploadProgress(Math.round(((i + 1) / photos.length) * 100));
      }

      // Snackbarで成功メッセージを表示
      setSnackbarMessage({
        type: 'success',
        title: '写真を追加しました',
        description: `${photos.length}枚の写真が正常に追加されました`,
      });
      
      // アルバムデータを再取得
      const fetchAlbumData = async () => {
        // アルバム情報を再取得してcover_photo_idを取得
        const { data: albumData } = await supabase
          .from("albums")
          .select("cover_photo_id")
          .eq("id", id)
          .single();

        const { data: photosData } = await supabase
          .from("photos")
          .select("id,storage_key,caption,exif,created_at,uploader_id") // uploader_idを追加
          .eq("album_id", id)
          .order("created_at");

        // アイキャッチ画像（cover_photo_id）を除外
        const coverPhotoId = (albumData as any)?.cover_photo_id;
        const filteredPhotosData = (photosData || []).filter(
          (photo: DbPhoto) => photo.id !== coverPhotoId
        );

        const photos: Photo[] = await Promise.all(
          filteredPhotosData.map(async (photo: DbPhoto) => {
            let photoUrl = "";
            const photoData = photo as any;
            
            if (photoData.storage_key?.startsWith('http')) {
              photoUrl = photoData.storage_key;
            } else if (photoData.storage_key) {
              const { data: signedUrl } = await supabase.storage
                .from("photos")
                .createSignedUrl(photoData.storage_key, 3600);
              photoUrl = signedUrl?.signedUrl || "";
            }

            // exifから説明を取得
            const exif = photoData.exif || {};
            const description = exif.description || null;

            return {
              id: photo.id,
              url: photoUrl,
              thumbnail: photoUrl,
              title: photo.caption || undefined,
              uploadedBy: {
                name: user?.email?.split("@")[0] || "ユーザー",
              },
              uploadedAt: photo.created_at,
              likes: 0,
              isLiked: false,
              uploaderId: photoData.uploader_id, // 追加
            };
          })
        );

        if (album) {
          setAlbum({
            ...album,
            photos,
          });
        }
      };

      await fetchAlbumData();
    } catch (err: any) {
      console.error("写真アップロードエラー:", err);
      const errorMessage = err.message || '写真のアップロードに失敗しました';
      
      // Snackbarでエラーメッセージを表示
      setSnackbarMessage({
        type: 'error',
        title: 'アップロードに失敗しました',
        description: errorMessage,
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // 写真削除機能
  const handlePhotoDelete = async (photoId: string) => {
    if (!user || !id) return;

    setDeleting(true);
    setMessage(null);

    try {
      // 写真情報を取得（uploader_idを含む）
      const { data: photoData } = await supabase
        .from("photos")
        .select("storage_key,uploader_id") // uploader_idを追加
        .eq("id", photoId)
        .single();

      if (!photoData) {
        throw new Error("写真が見つかりません");
      }

      // 権限チェック：投稿者本人のみ削除可能
      const photo = photoData as any;
      if (photo.uploader_id !== user.id) {
        throw new Error("この写真を削除する権限がありません");
      }

      const storageKey = photo.storage_key;

      // Storageから削除（URLの場合はスキップ）
      if (storageKey && !storageKey.startsWith('http')) {
        const { error: storageError } = await supabase.storage
          .from("photos")
          .remove([storageKey]);

        if (storageError) {
          console.warn("ストレージ削除エラー（無視）:", storageError);
        }
      }

      // データベースから削除
      const { error: deleteError } = await supabase
        .from("photos")
        .delete()
        .eq("id", photoId);

      if (deleteError) {
        throw new Error("写真の削除に失敗しました");
      }

      // アルバムデータを更新
      if (album) {
        setAlbum({
          ...album,
          photos: album.photos.filter((p) => p.id !== photoId),
        });
      }

      // Snackbarで成功メッセージを表示
      setSnackbarMessage({
        type: 'success',
        title: '写真を削除しました',
        description: '写真が正常に削除されました',
      });

      // Snackbarで成功メッセージを表示（handlePhotoDelete内でsetSnackbarMessageを使用）
    } catch (err: any) {
      console.error("写真削除エラー:", err);
      const errorMessage = err.message || '写真の削除に失敗しました';
      
      // Snackbarでエラーメッセージを表示
      setSnackbarMessage({
        type: 'error',
        title: '削除に失敗しました',
        description: errorMessage,
      });
      
      // Snackbarでエラーメッセージを表示（handlePhotoDelete内でsetSnackbarMessageを使用）
    } finally {
      setDeleting(false);
    }
  };

  // 写真キャプション更新機能
  const handlePhotoCaptionUpdate = async (photoId: string, caption: string) => {
    if (!user || !id) return;

    setUpdating(true);
    setMessage(null);

    try {
      const { error: updateError } = await (supabase
        .from("photos") as any)
        .update({ caption: caption || null })
        .eq("id", photoId);

      if (updateError) {
        throw new Error("キャプションの更新に失敗しました");
      }

      setMessage({ type: 'success', text: 'キャプションを更新しました' });

      // アルバムデータを更新
      if (album) {
        setAlbum({
          ...album,
          photos: album.photos.map((p) =>
            p.id === photoId ? { ...p, title: caption || undefined } : p
          ),
        });
      }
    } catch (err: any) {
      console.error("キャプション更新エラー:", err);
      setMessage({ type: 'error', text: err.message || 'キャプションの更新に失敗しました' });
    } finally {
      setUpdating(false);
    }
  };

  // 写真並び替え機能（アルバム状態に反映）
  const handlePhotoReorder = async (photoIds: string[]) => {
    if (!album) return;

    // 現在のアルバムの写真から、新しい順序に並び替え
    const photoMap = new Map(album.photos.map((p) => [p.id, p]));
    const reorderedPhotos = photoIds
      .map((id) => photoMap.get(id))
      .filter((p): p is Photo => Boolean(p));

    // 不足があれば既存順の残りも末尾に追加（安全対策）
    if (reorderedPhotos.length < album.photos.length) {
      const existingIds = new Set(reorderedPhotos.map((p) => p.id));
      album.photos.forEach((p) => {
        if (!existingIds.has(p.id)) reorderedPhotos.push(p);
      });
    }

    setAlbum({
      ...album,
      photos: reorderedPhotos,
    });

    // 将来、サーバー側に順序を保存する場合はここでAPI/DB更新を実装
    setMessage({ type: 'success', text: '写真の順序を更新しました（この画面内で有効）' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">アルバムが見つかりません</h2>
          <button onClick={handleBack} className="text-blue-600 hover:underline">
            アルバム一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {user && (
        <Header
          user={{
            name: user.email?.split("@")[0] || "ユーザー",
            email: user.email || "",
          }}
          onLogout={handleLogout}
        />
      )}
      <div className="min-h-screen bg-gray-50">
        {/* アルバムビューア */}
        <AlbumViewer
          album={album}
          onBack={handleBack}
          onShare={handleShare}
          onDownload={handleDownload}
          onLikePhoto={handleLikePhoto}
          onEdit={handleEdit}
          canEdit={isOwner}
          onDelete={handleAlbumDelete}
          canDelete={isOwner}
          deleting={deletingAlbum}
        />

        {/* 写真追加・管理セクション（オーナーのみ） */}
        {isOwner && album && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <PhotoUploadSection
              onUpload={handlePhotoUpload as (photos: PhotoUploadData[]) => Promise<void>}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />
            {/* Snackbarはページ最上部に固定表示されます */}
            {snackbarMessage && (
              <PhotoSnackbar
                message={{
                  id: Date.now().toString(),
                  type: snackbarMessage.type,
                  title: snackbarMessage.title,
                  description: snackbarMessage.description,
                }}
                onClose={() => setSnackbarMessage(null)}
                duration={3000}
              />
            )}
            {/* 通常のメッセージもSnackbarで表示 */}
            {message && (
              <PhotoSnackbar
                message={{
                  id: Date.now().toString(),
                  type: message.type,
                  title: message.text,
                }}
                onClose={() => setMessage(null)}
                duration={3000}
              />
            )}
            <PhotoManagementSection
              photos={album.photos.map((p) => ({
                id: p.id,
                url: p.url,
                thumbnail: p.thumbnail,
                title: p.title,
                uploadedAt: p.uploadedAt,
                uploaderId: p.uploaderId, // 追加
              }))}
              onDelete={handlePhotoDelete}
              onUpdateCaption={handlePhotoCaptionUpdate}
              onReorder={handlePhotoReorder}
              deleting={deleting}
              updating={updating}
              currentUserId={user?.id} // 追加
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumDetailPage;
