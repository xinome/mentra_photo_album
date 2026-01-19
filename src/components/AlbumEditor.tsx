"use client";

import { useState, useRef, useEffect } from "react";
import { X, ArrowLeft, Image as ImageIcon, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { getCategoryDefaultImage } from "@/lib/category-images";

interface AlbumEditorProps {
  albumId: string;
  initialData: {
    title: string;
    description: string;
    category: string;
    isPublic: boolean;
    coverImageUrl?: string;
  };
  onBack: () => void;
  onSave: (albumData: AlbumUpdateData) => void;
}

interface AlbumUpdateData {
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
  coverImage?: File;
  removeCoverImage?: boolean;
}

export const AlbumEditor = ({ albumId, initialData, onBack, onSave }: AlbumEditorProps) => {
  const [albumData, setAlbumData] = useState({
    title: initialData.title,
    description: initialData.description || "",
    category: initialData.category,
    isPublic: initialData.isPublic,
  });
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    initialData.coverImageUrl || null
  );
  const [newCoverImage, setNewCoverImage] = useState<File | undefined>(undefined);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  // initialData.coverImageUrlが変更された場合にcoverImagePreviewを更新
  useEffect(() => {
    if (initialData.coverImageUrl && !newCoverImage && !removeCoverImage) {
      setCoverImagePreview(initialData.coverImageUrl);
    }
  }, [initialData.coverImageUrl, newCoverImage, removeCoverImage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (albumData.title && albumData.category) {
      const updateData: AlbumUpdateData = {
        title: albumData.title,
        description: albumData.description,
        category: albumData.category,
        isPublic: albumData.isPublic,
      };

      if (removeCoverImage) {
        updateData.removeCoverImage = true;
      } else if (newCoverImage) {
        updateData.coverImage = newCoverImage;
      }

      onSave(updateData);
    }
  };

  const handleCoverImageChange = (file: File | undefined) => {
    if (file) {
      setNewCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
      setRemoveCoverImage(false);
    }
  };

  const handleRemoveCoverImage = () => {
    setNewCoverImage(undefined);
    setCoverImagePreview(null);
    setRemoveCoverImage(true);
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = '';
    }
  };

  const isFormValid = albumData.title && albumData.category;

  // 表示するカバー画像を決定
  // 優先順位: 1. 新しいカバー画像のプレビュー 2. 既存のカバー画像 3. デフォルト画像（削除されていない場合のみ）
  const displayCoverImage = coverImagePreview || 
    (!removeCoverImage && albumData.category ? getCategoryDefaultImage(albumData.category) : null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
          <div>
            <h1 className="text-2xl font-medium">アルバムを編集</h1>
            <p className="text-muted-foreground">
              アルバムのメタ情報を編集できます
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Album Information */}
          <Card className="bg-white border shadow-sm">
            <CardHeader>
              <CardTitle>アルバム情報</CardTitle>
              <CardDescription>
                アルバムの基本情報を編集してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">アルバム名 *</Label>
                  <Input
                    id="title"
                    placeholder="例: 山田家結婚式"
                    className="bg-white"
                    value={albumData.title}
                    onChange={(e) =>
                      setAlbumData({ ...albumData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">カテゴリ *</Label>
                  <Select
                    value={albumData.category}
                    onValueChange={(value) =>
                      setAlbumData({ ...albumData, category: value })
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      <SelectItem value="wedding">結婚式</SelectItem>
                      <SelectItem value="event">イベント</SelectItem>
                      <SelectItem value="family">家族</SelectItem>
                      <SelectItem value="sports">スポーツ・部活</SelectItem>
                      <SelectItem value="travel">旅行</SelectItem>
                      <SelectItem value="other">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">説明（任意）</Label>
                <Textarea
                  id="description"
                  placeholder="アルバムの説明を入力してください"
                  rows={3}
                  className="bg-white"
                  value={albumData.description}
                  onChange={(e) =>
                    setAlbumData({ ...albumData, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="cover-image">アイキャッチ画像（任意）</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>推奨サイズ: 1280×720px（16:9）</p>
                      <p>最大容量: 5MB</p>
                      <p>対応形式: JPEG, PNG, GIF</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  未設定の場合は{albumData.category ? 'カテゴリに合わせた' : ''}デフォルト画像が使用されます
                </p>
                <div className="flex items-center gap-4">
                  <input
                    ref={coverImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleCoverImageChange(file);
                      }
                    }}
                  />
                  {displayCoverImage ? (
                    <div className="relative">
                      <div className="w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <ImageWithFallback
                          src={displayCoverImage}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {removeCoverImage && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <span className="text-xs text-white font-medium">デフォルト</span>
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => coverImageInputRef.current?.click()}
                          className="h-6 px-2 text-xs bg-white"
                        >
                          変更
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveCoverImage}
                          className="h-6 w-6 p-0 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => coverImageInputRef.current?.click()}
                      className="gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      画像を選択
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <Label htmlFor="public" className="text-base font-medium">公開設定</Label>
                    <p className="text-sm text-muted-foreground">
                      リンクを知っている人なら誰でも閲覧できます
                    </p>
                  </div>
                  <Switch
                    id="public"
                    checked={albumData.isPublic}
                    onCheckedChange={(checked) =>
                      setAlbumData({ ...albumData, isPublic: checked })
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // 公開設定の詳細設定（将来的にモーダルなどを開く）
                    alert("公開設定の詳細設定機能は今後実装予定です");
                  }}
                  className="w-full"
                >
                  設定
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onBack}>
              キャンセル
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              変更を保存
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

