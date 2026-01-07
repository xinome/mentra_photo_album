"use client";

import { useRouter, useParams } from "next/navigation";
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

export default function AlbumDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const id = params.id as string;
  
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<{ type: 'success' | 'error', title: string, description?: string } | null>(null);

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

      // 写真を取得
      const { data: photosData, error: photosError } = await supabase
        .from("photos")
        .select("id,storage_key,caption,exif,created_at")
        .eq("album_id", id)
        .order("created_at");

      console.log("写真取得結果:", { photosData, photosError });

      // 各写真のURLを取得
      const photos: Photo[] = await Promise.all(
        (photosData || []).map(async (photo: DbPhoto) => {
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
  };

  const handleDownload = () => {
    alert("アルバムのダウンロードを開始します...");
    // TODO: ダウンロード機能の実装
  };

  const handleLikePhoto = (photoId: string) => {
    console.log("いいね:", photoId);
    // TODO: いいね機能の実装
  };

  const handleEdit = () => {
    router.push(`/albums/${id}/edit`);
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

      setMessage({ type: 'success', text: `${photos.length}枚の写真を追加しました` });
      
      // アルバムデータを再取得
      const fetchAlbumData = async () => {
        const { data: photosData } = await supabase
          .from("photos")
          .select("id,storage_key,caption,exif,created_at")
          .eq("album_id", id)
          .order("created_at");

        const photos: Photo[] = await Promise.all(
          (photosData || []).map(async (photo: DbPhoto) => {
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
      setMessage({ type: 'error', text: err.message || '写真のアップロードに失敗しました' });
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
      // 写真情報を取得
      const { data: photoData } = await supabase
        .from("photos")
        .select("storage_key")
        .eq("id", photoId)
        .single();

      if (!photoData) {
        throw new Error("写真が見つかりません");
      }

      const storageKey = (photoData as any).storage_key;

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

      setMessage({ type: 'success', text: '写真を削除しました' });
    } catch (err: any) {
      console.error("写真削除エラー:", err);
      const errorMessage = err.message || '写真の削除に失敗しました';
      
      // Snackbarでエラーメッセージを表示
      setSnackbarMessage({
        type: 'error',
        title: '削除に失敗しました',
        description: errorMessage,
      });
      
      setMessage({ type: 'error', text: errorMessage });
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
        />

        {/* 写真追加・管理セクション（オーナーのみ） */}
        {isOwner && album && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* メッセージ表示 */}
            {message && (
              <div className={`p-4 rounded-xl shadow-md border-2 ${
                message.type === 'success' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200 shadow-green-100/50' 
                  : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-200 shadow-red-100/50'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium">{message.text}</span>
                </div>
              </div>
            )}

            <PhotoUploadSection
              onUpload={handlePhotoUpload as (photos: PhotoUploadData[]) => Promise<void>}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />
            {/* Snackbar表示位置（写真の管理セクションの直前） */}
            {snackbarMessage && (
              <PhotoSnackbar
                message={{
                  id: Date.now().toString(),
                  type: snackbarMessage.type,
                  title: snackbarMessage.title,
                  description: snackbarMessage.description,
                }}
                onClose={() => setSnackbarMessage(null)}
              />
            )}
            <PhotoManagementSection
              photos={album.photos.map((p) => ({
                id: p.id,
                url: p.url,
                thumbnail: p.thumbnail,
                title: p.title,
                uploadedAt: p.uploadedAt,
              }))}
              onDelete={handlePhotoDelete}
              onUpdateCaption={handlePhotoCaptionUpdate}
              onReorder={handlePhotoReorder}
              deleting={deleting}
              updating={updating}
            />
          </div>
        )}
      </div>
    </div>
  );
}
