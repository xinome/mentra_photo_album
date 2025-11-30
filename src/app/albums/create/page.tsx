"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { AlbumCreator } from "@/components/AlbumCreator";
import { Header } from "@/components/Header";
import { useState } from "react";

interface AlbumData {
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
  photos: File[];
}

export default function CreateAlbumPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleSaveAlbum = async (albumData: AlbumData) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      console.log("CreateAlbumPage: アルバム保存開始", albumData);

      // 1. 写真をSupabase Storageにアップロード
      const uploadedPhotos: Array<{ storageKey: string; publicUrl: string }> = [];
      const baseTimestamp = Date.now();
      
      for (let i = 0; i < albumData.photos.length; i++) {
        const file = albumData.photos[i];
        // ファイル名を安全な形式に変換（日本語や特殊文字を除去）
        const originalName = file.name;
        const fileExtension = originalName.substring(originalName.lastIndexOf('.'));
        const sanitizedName = originalName
          .replace(/\.[^/.]+$/, '') // 拡張子を一時的に除去
          .replace(/[^a-zA-Z0-9_-]/g, '_') // 英数字以外をアンダースコアに置換
          .substring(0, 50) // 長さを制限
          + fileExtension; // 拡張子を追加
        
        const randomSuffix = Math.random().toString(36).substring(2, 9);
        const fileName = `${user.id}/${baseTimestamp}-${randomSuffix}-${i}-${sanitizedName}`;
        
        console.log(`CreateAlbumPage: 写真アップロード中 (${i + 1}/${albumData.photos.length}): ${fileName}`);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("photos")
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`CreateAlbumPage: 写真アップロードエラー:`, uploadError);
          throw new Error(`写真のアップロードに失敗しました: ${uploadError.message}`);
        }

        // 署名付きURLを取得
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("photos")
          .createSignedUrl(fileName, 3600);

        if (signedUrlError) {
          console.warn("CreateAlbumPage: 署名付きURL取得エラー（アップロードは成功）:", signedUrlError);
        }

        uploadedPhotos.push({
          storageKey: fileName,
          publicUrl: signedUrlData?.signedUrl || ""
        });
      }

      console.log("CreateAlbumPage: 写真アップロード完了", uploadedPhotos.length, "件");

      // 2. albumsテーブルにアルバム情報を保存
      console.log("CreateAlbumPage: アルバム情報を保存中...", {
        title: albumData.title,
        description: albumData.description,
        is_public: albumData.isPublic,
        owner_id: user.id
      });
      
      const { data: album, error: albumError } = await supabase
        .from("albums")
        .insert({ 
          owner_id: user.id,
          title: albumData.title,
          description: albumData.description || null,
          is_public: albumData.isPublic,
        })
        .select()
        .single();

      if (albumError) {
        console.error("CreateAlbumPage: アルバム保存エラー", albumError);
        throw new Error(`アルバムの保存に失敗しました: ${albumError.message}`);
      }

      console.log("CreateAlbumPage: アルバム保存完了", album.id);

      // 3. photosテーブルに写真情報を保存
      if (uploadedPhotos.length > 0) {
        console.log("CreateAlbumPage: 写真情報を保存中...", uploadedPhotos.length, "件");
        const photoInserts = uploadedPhotos.map((photo, index) => ({
          album_id: album.id,
          uploader_id: user.id,
          storage_key: photo.storageKey,
          mime_type: albumData.photos[index]?.type || null,
          bytes: albumData.photos[index]?.size || null,
        }));

        const { error: photosError } = await supabase
          .from("photos")
          .insert(photoInserts);

        if (photosError) {
          console.error("CreateAlbumPage: 写真情報保存エラー", photosError);
          throw new Error(`写真情報の保存に失敗しました: ${photosError.message}`);
        }

        console.log("CreateAlbumPage: 写真情報保存完了", photoInserts.length, "件");
      }

      // 4. 作成したアルバムの詳細ページに遷移
      router.push(`/albums/${album.id}`);

    } catch (error) {
      console.error("CreateAlbumPage: アルバム作成エラー", error);
      const errorMessage = error instanceof Error ? error.message : "予期しないエラーが発生しました";
      alert(`アルバムの作成に失敗しました: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

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
        <AlbumCreator
          onBack={handleBack}
          onSave={handleSaveAlbum}
        />
      </div>
    </AuthGuard>
  );
}

