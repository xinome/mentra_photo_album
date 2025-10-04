"use client";

import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Album {
  id: string;
  title: string;
  updated_at: string;
}

export default function AlbumsPage() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      if (!user) return;
      
      console.log("AlbumsPage: ユーザー情報", user);
      
      const { data: albums, error } = await supabase
        .from("albums")
        .select("id,title,updated_at")
        .order("updated_at", { ascending: false });

      console.log("AlbumsPage: アルバム取得結果", { albums, error });
      
      if (albums) {
        setAlbums(albums);
      }
      setLoading(false);
    };

    fetchAlbums();
  }, [user]);

  const createAlbum = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("albums")
      .insert({ title: "新しいアルバム", owner_id: user.id })
      .select();

    if (data && data[0]) {
      setAlbums(prev => [data[0], ...prev]);
    }
    console.log("アルバム作成結果", { data, error });
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
      <main className="mx-auto max-w-3xl p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">アルバム</h1>
          <button 
            onClick={createAlbum}
            className="rounded bg-black text-white px-3 py-2"
          >
            新規作成
          </button>
        </div>
        <ul className="mt-6 space-y-2">
          {albums?.map(a => (
            <li key={a.id}>
              <Link className="block border rounded p-3 hover:bg-gray-50" href={`/albums/${a.id}`}>
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </AuthGuard>
  );
}
