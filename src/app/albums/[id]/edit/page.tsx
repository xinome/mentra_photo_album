"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AlbumEditor } from "@/components/AlbumEditor";
import { useAuth } from "@/components/AuthProvider";
import { getCategoryDefaultImage } from "@/lib/category-images";

interface AlbumUpdateData {
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
  coverImage?: File;
  removeCoverImage?: boolean;
}

export default function AlbumEditPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const albumId = params.id as string;

  const [album, setAlbum] = useState<{
    id: string;
    title: string;
    description: string;
    category: string;
    isPublic: boolean;
    coverImageUrl?: string;
    ownerId: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAlbumData = async () => {
      if (!albumId || !user) return;

      // アルバム情報を取得
      const { data: albumData, error: albumError } = await supabase
        .from("albums")
        .select("*")
        .eq("id", albumId)
        .single();

      if (albumError || !albumData) {
        console.error("アルバム取得エラー:", albumError);
        setLoading(false);
        return;
      }

      // 作成者のみ編集可能
      const album = albumData as any;
      if (album.owner_id !== user.id) {
        alert("このアルバムを編集する権限がありません");
        router.push(`/albums/${albumId}`);
        return;
      }

      // カバー画像のURLを取得
      let coverImageUrl: string | undefined;
      if (album.cover_photo_id) {
        const { data: coverPhoto } = await supabase
          .from("photos")
          .select("storage_key")
          .eq("id", album.cover_photo_id)
          .single();

        if (coverPhoto && (coverPhoto as any).storage_key) {
          const storageKey = (coverPhoto as any).storage_key;
          if (storageKey.startsWith('http')) {
            coverImageUrl = storageKey;
          } else {
            const { data: signedUrl } = await supabase.storage
              .from("photos")
              .createSignedUrl(storageKey, 3600);
            coverImageUrl = signedUrl?.signedUrl;
          }
        }
      }

      // カバー画像がない場合はカテゴリのデフォルト画像を使用
      if (!coverImageUrl && album.category) {
        coverImageUrl = getCategoryDefaultImage(album.category);
      }

      setAlbum({
        id: album.id,
        title: album.title,
        description: album.description || "",
        category: album.category || "other",
        isPublic: album.is_public || false,
        coverImageUrl,
        ownerId: album.owner_id,
      });

      setLoading(false);
    };

    fetchAlbumData();
  }, [albumId, user, router]);

  const handleSave = async (updateData: AlbumUpdateData) => {
    if (!album || !user) return;

    setSaving(true);

    try {
      let coverPhotoId: string | null = null;

      // アイキャッチ画像の処理
      if (updateData.removeCoverImage) {
        // カバー画像を削除（デフォルト画像に戻す）
        coverPhotoId = null;
      } else if (updateData.coverImage) {
        // 新しいカバー画像をアップロード
        const fileExt = updateData.coverImage.name.split('.').pop();
        const fileName = `${albumId}/cover_${Date.now()}.${fileExt}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("photos")
          .upload(fileName, updateData.coverImage, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error("画像アップロードエラー:", uploadError);
          alert("画像のアップロードに失敗しました");
          setSaving(false);
          return;
        }

        // 既存のカバー画像を削除（あれば）
        if (album.coverImageUrl && !album.coverImageUrl.startsWith('http')) {
          // 既存のカバー画像を削除する処理（必要に応じて実装）
        }

        // 写真レコードを作成
        const { data: photoData, error: photoError } = await supabase
          .from("photos")
          .insert({
            album_id: albumId,
            storage_key: fileName,
            caption: "カバー画像",
          } as any)
          .select()
          .single();

        if (photoError) {
          console.error("写真レコード作成エラー:", photoError);
          alert("画像の保存に失敗しました");
          setSaving(false);
          return;
        }

        coverPhotoId = photoData ? (photoData as any).id : null;
      } else {
        // カバー画像は変更なし（既存のものを維持）
        const { data: existingAlbum } = await supabase
          .from("albums")
          .select("cover_photo_id")
          .eq("id", albumId)
          .single();

        coverPhotoId = existingAlbum ? (existingAlbum as any).cover_photo_id || null : null;
      }

      // アルバム情報を更新
      const { error: updateError } = await (supabase
        .from("albums") as any)
        .update({
          title: updateData.title,
          description: updateData.description,
          category: updateData.category,
          is_public: updateData.isPublic,
          cover_photo_id: coverPhotoId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", albumId);

      if (updateError) {
        console.error("アルバム更新エラー:", updateError);
        alert("アルバムの更新に失敗しました");
        setSaving(false);
        return;
      }

      // 編集画面から詳細画面に戻る
      router.push(`/albums/${albumId}`);
    } catch (error) {
      console.error("エラー:", error);
      alert("エラーが発生しました");
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(`/albums/${albumId}`);
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
          <button onClick={() => router.push("/albums")} className="text-blue-600 hover:underline">
            アルバム一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <AlbumEditor
      albumId={albumId}
      initialData={{
        title: album.title,
        description: album.description,
        category: album.category,
        isPublic: album.isPublic,
        coverImageUrl: album.coverImageUrl,
      }}
      onBack={handleBack}
      onSave={handleSave}
    />
  );
}

