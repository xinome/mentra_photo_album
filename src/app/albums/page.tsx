"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { Header } from "@/components/Header";

interface DbAlbum {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
  description?: string;
}

interface DashboardAlbum {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  photoCount: number;
  createdAt: string;
  category: "wedding" | "event" | "family" | "sports" | "other";
  isShared: boolean;
}

export default function AlbumsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [albums, setAlbums] = useState<DashboardAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileChecked, setProfileChecked] = useState(false);

  // 新規ユーザーのプロフィールチェック
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;
      
      console.log("AlbumsPage: プロフィールチェック開始");
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      console.log("AlbumsPage: プロフィール確認結果", { profile, error });

      // プロフィールが存在しないか、display_nameが設定されていない場合
      if (!profile || !profile.display_name) {
        console.log("AlbumsPage: 新規ユーザー検出 - プロフィール設定へリダイレクト");
        router.push("/account/setup");
        return;
      }

      setProfileChecked(true);
    };

    if (user) {
      checkProfile();
    }
  }, [user, router]);

  useEffect(() => {
    const fetchAlbums = async () => {
      if (!user || !profileChecked) return;
      
      console.log("AlbumsPage: ユーザー情報", user);
      
      const { data: albumsData, error } = await supabase
        .from("albums")
        .select("id,title,updated_at,description,created_at")
        .order("created_at", { ascending: false });

      console.log("AlbumsPage: アルバム取得結果", { albumsData, error });
      
      if (albumsData) {
        // 各アルバムの写真数を取得
        const albumsWithDetails = await Promise.all(
          albumsData.map(async (album: DbAlbum) => {
            const { count } = await supabase
              .from("photos")
              .select("id", { count: "exact", head: true })
              .eq("album_id", album.id);

            // カバー画像を取得（最初の写真）
            const { data: photos } = await supabase
              .from("photos")
              .select("storage_key")
              .eq("album_id", album.id)
              .limit(1);

            let coverImage = "https://images.unsplash.com/photo-1587955793432-7c4ff80918ba?w=400";
            if (photos && photos.length > 0) {
              // storage_keyがURLの場合は直接使用、それ以外はStorageから取得
              if (photos[0].storage_key.startsWith('http')) {
                coverImage = photos[0].storage_key;
              } else {
                const { data: signedUrl } = await supabase.storage
                  .from("photos")
                  .createSignedUrl(photos[0].storage_key, 3600);
                if (signedUrl) {
                  coverImage = signedUrl.signedUrl;
                }
              }
            }

            return {
              id: album.id,
              title: album.title,
              description: album.description || "アルバムの説明",
              coverImage,
              photoCount: count || 0,
              createdAt: album.created_at || album.updated_at,
              category: "other" as const,
              isShared: false, // TODO: 共有情報を取得
            };
          })
        );
        
        setAlbums(albumsWithDetails);
      }
      setLoading(false);
    };

    fetchAlbums();
  }, [user, profileChecked]);

  const handleCreateAlbum = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("albums")
      .insert({ 
        title: "新しいアルバム",
        description: "アルバムの説明を追加してください",
        owner_id: user.id 
      })
      .select();

    if (data && data[0]) {
      // 新しいアルバムをリストに追加
      const newAlbum: DashboardAlbum = {
        id: data[0].id,
        title: data[0].title,
        description: data[0].description || "アルバムの説明",
        coverImage: "https://images.unsplash.com/photo-1587955793432-7c4ff80918ba?w=400",
        photoCount: 0,
        createdAt: data[0].created_at || data[0].updated_at,
        category: "other",
        isShared: false,
      };
      setAlbums(prev => [newAlbum, ...prev]);
      
      // アルバム詳細ページに遷移
      router.push(`/albums/${data[0].id}`);
    }
    console.log("アルバム作成結果", { data, error });
  };

  const handleOpenAlbum = (albumId: string) => {
    router.push(`/albums/${albumId}`);
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

  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
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
        <Dashboard
          albums={albums}
          onCreateAlbum={handleCreateAlbum}
          onOpenAlbum={handleOpenAlbum}
        />
      </div>
    </AuthGuard>
  );
}
