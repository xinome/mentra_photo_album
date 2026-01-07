"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AlbumViewer } from "@/components/AlbumViewer";
import { Header } from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
import { getCategoryDefaultImage } from "@/lib/category-images";

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
        .select("id,storage_key,caption,created_at")
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
      <AlbumViewer
        album={album}
        onBack={handleBack}
        onShare={handleShare}
        onDownload={handleDownload}
        onLikePhoto={handleLikePhoto}
        onEdit={handleEdit}
        canEdit={isOwner}
      />
    </div>
  );
}
