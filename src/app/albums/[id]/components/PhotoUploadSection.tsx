"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";

export interface PhotoUploadData {
  file: File;
  title: string;
  takenAt: Date | null;
  description: string;
}

interface PhotoPreview {
  file: File;
  url: string;
  id: string;
  title: string;
  takenAt: Date | null;
  description: string;
}

interface PhotoUploadSectionProps {
  onUpload: (photos: PhotoUploadData[]) => Promise<void>;
  uploading?: boolean;
  uploadProgress?: number;
}

export const PhotoUploadSection = ({
  onUpload,
  uploading = false,
  uploadProgress = 0,
}: PhotoUploadSectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newPhotos: PhotoPreview[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const id = Math.random().toString(36).substr(2, 9);
        const url = URL.createObjectURL(file);
        // ファイル名から初期タイトルを設定
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        newPhotos.push({
          file,
          url,
          id,
          title: fileName,
          takenAt: null,
          description: "",
        });
      }
    });

    setPhotos((prev) => [...prev, ...newPhotos]);
    setIsDialogOpen(true);
    setCurrentPhotoIndex(0);
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

  const updatePhoto = (id: string, updates: Partial<PhotoPreview>) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === id ? { ...photo, ...updates } : photo))
    );
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.url);
      }
      const updated = prev.filter((photo) => photo.id !== id);
      if (updated.length === 0) {
        setIsDialogOpen(false);
      } else if (currentPhotoIndex >= updated.length) {
        setCurrentPhotoIndex(updated.length - 1);
      }
      return updated;
    });
  };

  const handleNext = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const handleUpload = async () => {
    if (photos.length === 0) return;

    const uploadData: PhotoUploadData[] = photos.map((photo) => ({
      file: photo.file,
      title: photo.title,
      takenAt: photo.takenAt,
      description: photo.description,
    }));

    await onUpload(uploadData);

    // アップロード後、プレビューをクリア
    photos.forEach((photo) => {
      URL.revokeObjectURL(photo.url);
    });
    setPhotos([]);
    setIsDialogOpen(false);
    setCurrentPhotoIndex(0);
  };

  const currentPhoto = photos[currentPhotoIndex];

  return (
    <Card className="border-2 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">写真を追加</CardTitle>
            <CardDescription className="mt-0.5">
              アルバムに新しい写真を追加できます
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* ドラッグ&ドロップエリア */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 bg-gray-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">
              写真をドラッグ&ドロップするか、クリックして選択
            </p>
            <p className="text-sm text-gray-500 mb-4">
              対応形式: JPEG, PNG, GIF, WebP（最大10MB/枚）
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 border-2"
                >
                  <Upload className="h-4 w-4" />
                  ファイルを選択
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>写真の情報を入力</DialogTitle>
                  <DialogDescription>
                    {photos.length > 1 && (
                      <span>
                        {currentPhotoIndex + 1} / {photos.length} 枚目
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>

                {currentPhoto && (
                  <div className="space-y-6">
                    {/* 写真プレビュー */}
                    <div className="flex justify-center">
                      <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={currentPhoto.url}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    {/* 写真情報フォーム */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">タイトル *</Label>
                        <Input
                          id="title"
                          value={currentPhoto.title}
                          onChange={(e) =>
                            updatePhoto(currentPhoto.id, { title: e.target.value })
                          }
                          placeholder="写真のタイトルを入力"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="takenAt">撮影日</Label>
                        <div className="text-sm text-muted-foreground mb-1">
                          {currentPhoto.takenAt
                            ? format(currentPhoto.takenAt, "yyyy年MM月dd日", { locale: ja })
                            : "カレンダーから撮影日を選択"}
                        </div>
                        <div className="border rounded-md p-2">
                          <Calendar
                            mode="single"
                            selected={currentPhoto.takenAt || undefined}
                            onSelect={(date) =>
                              updatePhoto(currentPhoto.id, { takenAt: date || null })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">説明</Label>
                        <Textarea
                          id="description"
                          value={currentPhoto.description}
                          onChange={(e) =>
                            updatePhoto(currentPhoto.id, { description: e.target.value })
                          }
                          placeholder="写真の説明を入力（任意）"
                          rows={4}
                        />
                      </div>
                    </div>

                    {/* ナビゲーション */}
                    {photos.length > 1 && (
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={currentPhotoIndex === 0}
                        >
                          前へ
                        </Button>
                        <div className="flex gap-2">
                          {photos.map((_, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setCurrentPhotoIndex(index)}
                              className={`h-2 w-2 rounded-full transition-colors ${
                                index === currentPhotoIndex
                                  ? "bg-blue-600"
                                  : "bg-gray-300 hover:bg-gray-400"
                              }`}
                            />
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleNext}
                          disabled={currentPhotoIndex === photos.length - 1}
                        >
                          次へ
                        </Button>
                      </div>
                    )}

                    {/* 削除ボタン */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removePhoto(currentPhoto.id)}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        この写真を削除
                      </Button>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      photos.forEach((photo) => URL.revokeObjectURL(photo.url));
                      setPhotos([]);
                      setIsDialogOpen(false);
                    }}
                  >
                    キャンセル
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading || photos.length === 0}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  >
                    {uploading
                      ? `アップロード中... ${uploadProgress}%`
                      : `${photos.length}枚の写真をアップロード`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* アップロード進捗 */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">アップロード中...</span>
                <span className="text-gray-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
