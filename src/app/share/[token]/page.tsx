"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SharedAlbumViewer } from "@/components/SharedAlbumViewer";

// 動的レンダリングを強制（環境変数とAPIに依存）
export const dynamic = 'force-dynamic';

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
}

interface SharedAlbum {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  photos: Photo[];
  createdAt: string;
  category: "wedding" | "event" | "family" | "sports" | "other";
  contributors: Array<{
    name: string;
    avatar?: string;
  }>;
  owner: {
    name: string;
    avatar?: string;
  };
}

interface ShareData {
  album: {
    title: string;
    description?: string;
    category?: string;
  };
  photos: Array<{
    id: string;
    signed_url: string;
    caption: string | null;
    created_at: string;
    storage_key: string;
  }>;
}

const SharePage = () => {
  const params = useParams();
  const token = params.token as string;
  
  const [album, setAlbum] = useState<SharedAlbum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedAlbum = async () => {
      try {
        const shareUrl = process.env.NEXT_PUBLIC_SHARE_FUNCTION_URL || process.env.SHARE_FUNCTION_URL;
        
        if (!shareUrl) {
          console.error("共有機能のURLが設定されていません");
          setError("共有機能が利用できません");
          setLoading(false);
          return;
        }

        const res = await fetch(`${shareUrl}?token=${token}`, { cache: "no-store" });
        
        if (!res.ok) {
          setError("リンクが無効です。");
          setLoading(false);
          return;
        }

        const data: ShareData = await res.json();
        
        const photos: Photo[] = data.photos.map((photo) => ({
          id: photo.id,
          url: photo.signed_url,
          thumbnail: photo.signed_url,
          title: photo.caption || undefined,
          uploadedBy: {
            name: "投稿者",
          },
          uploadedAt: photo.created_at,
          likes: 0,
        }));

        setAlbum({
          id: "shared",
          title: data.album?.title || "共有アルバム",
          description: data.album?.description || "共有されたアルバムです",
          coverImage: photos.length > 0 ? photos[0].url : "",
          photos,
          createdAt: photos.length > 0 ? photos[0].uploadedAt : new Date().toISOString(),
          category: (data.album?.category as 'wedding' | 'event' | 'family' | 'sports' | 'other') || 'other',
          contributors: [{ name: "投稿者" }],
          owner: { name: "オーナー" },
        });
        
        setLoading(false);
      } catch (err) {
        console.error("共有アルバム取得エラー:", err);
        setError("アルバムの読み込みに失敗しました");
        setLoading(false);
      }
    };

    if (token) {
      fetchSharedAlbum();
    }
  }, [token]);

  const handleDownload = () => {
    alert("アルバムのダウンロードを開始します...");
    // TODO: ダウンロード機能の実装
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("共有リンクをコピーしました！");
    } catch (err) {
      console.error("クリップボードへのコピーエラー:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <main className="p-6 text-center min-h-screen flex items-center justify-center">
        <div>
          <h1 className="text-xl font-semibold mb-2">エラー</h1>
          <p className="text-gray-600">{error || "リンクが無効です。"}</p>
        </div>
      </main>
    );
  }

  return (
    <SharedAlbumViewer
      album={album}
      onDownload={handleDownload}
      onShare={handleShare}
    />
  );
};

export default SharePage;
