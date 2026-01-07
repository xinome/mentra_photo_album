"use client";

import { useState, useRef } from "react";
import { Upload, X, Camera, FolderOpen, ArrowLeft, Image as ImageIcon, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { getCategoryDefaultImage } from "@/lib/category-images";

interface AlbumCreatorProps {
  onBack: () => void;
  onSave: (albumData: AlbumData) => void;
}

interface AlbumData {
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
  photos: File[];
  coverImage?: File;
}

interface PhotoPreview {
  file: File;
  url: string;
  id: string;
}


export function AlbumCreator({ onBack, onSave }: AlbumCreatorProps) {
  const [albumData, setAlbumData] = useState<AlbumData>({
    title: "",
    description: "",
    category: "",
    isPublic: false,
    photos: [],
  });
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newPhotos: PhotoPreview[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const id = Math.random().toString(36).substr(2, 9);
        const url = URL.createObjectURL(file);
        newPhotos.push({ file, url, id });
      }
    });

    setPhotos((prev) => [...prev, ...newPhotos]);
    setAlbumData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos.map(p => p.file)],
    }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const updated = prev.filter((photo) => photo.id !== id);
      setAlbumData((prevData) => ({
        ...prevData,
        photos: updated.map(p => p.file),
      }));
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (albumData.title && albumData.category) {
      // Simulate upload progress (if photos exist)
      if (photos.length > 0) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
            setUploadProgress(0);
          onSave(albumData);
        }
      }, 200);
      } else {
        // No photos, save immediately
        onSave(albumData);
      }
    }
  };

  const isFormValid = albumData.title && albumData.category;

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
            <h1 className="text-2xl font-medium">新しいアルバムを作成</h1>
            <p className="text-muted-foreground">
              アルバム情報を入力して写真をアップロードしてください
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* アルバム情報 */}
          <Card className="bg-white border shadow-sm">
            <CardHeader>
              <CardTitle>アルバム情報</CardTitle>
              <CardDescription>
                アルバムの基本情報を入力してください
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
                <div className="space-y-4">
                  <input
                    ref={coverImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAlbumData({ ...albumData, coverImage: file });
                        setCoverImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {coverImagePreview ? (
                    <div className="relative">
                      <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
                        <ImageWithFallback
                          src={coverImagePreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                        onClick={() => {
                          setAlbumData({ ...albumData, coverImage: undefined });
                          setCoverImagePreview(null);
                          if (coverImageInputRef.current) {
                            coverImageInputRef.current.value = '';
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : albumData.category ? (
                    <div className="relative">
                      <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
                        <ImageWithFallback
                          src={getCategoryDefaultImage(albumData.category)}
                          alt="Default cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="text-sm text-white font-medium">デフォルト画像</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => coverImageInputRef.current?.click()}
                        className="absolute bottom-4 right-4 bg-white"
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        画像を変更
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => coverImageInputRef.current?.click()}
                        className="gap-2"
                      >
                        <ImageIcon className="h-5 w-5" />
                        画像を選択
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="public" className="text-base font-medium">公開設定</Label>
                    <p className="text-sm text-muted-foreground">
                      リンクを知っている人なら誰でも閲覧できます
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                  <Switch
                    id="public"
                    checked={albumData.isPublic}
                    onCheckedChange={(checked) =>
                      setAlbumData({ ...albumData, isPublic: checked })
                    }
                  />
                </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 写真アップロード */}
          <Card className="bg-white border shadow-sm">
            <CardHeader>
                  <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                      写真をアップロード（任意）
              </CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>推奨サイズ: 各画像 2000px以下</p>
                        <p>1枚あたりの最大容量: 10MB</p>
                        <p>対応形式: JPEG, PNG, GIF</p>
                        <p>※後からいつでも追加できます</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
              <CardDescription>
                ドラッグ&ドロップまたはクリックして写真を選択してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-2">
                    {isDragging ? (
                      <FolderOpen className="h-12 w-12 text-primary" />
                    ) : (
                      <Upload className="h-12 w-12 text-gray-400" />
                    )}
                    <h3 className="text-lg font-medium">
                      {isDragging ? "写真をドロップしてください" : "写真を選択"}
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground">
                    または<span className="text-primary font-medium">クリック</span>してファイルを選択
                  </p>
                  
                  <div className="text-sm text-muted-foreground">
                    対応形式: JPEG, PNG, GIF（最大10MB）
                  </div>
                </div>
              </div>

              {/* Photo Previews */}
              {photos.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      選択された写真 ({photos.length}枚)
                    </h4>
                    <Badge variant="outline">{photos.length}枚</Badge>
                  </div>
                  
                      <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                          <ImageWithFallback
                            src={photo.url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePhoto(photo.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>アップロード中...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onBack}>
              キャンセル
            </Button>
            <Button type="submit" disabled={!isFormValid || uploadProgress > 0}>
              {uploadProgress > 0 ? "アップロード中..." : "アルバムを作成"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
