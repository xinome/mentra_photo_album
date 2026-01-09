"use client";

import { useState } from "react";
import { Trash2, Edit2, GripVertical, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  title?: string;
  uploadedAt: string;
  uploaderId?: string; // 追加：投稿者ID
}

interface PhotoManagementSectionProps {
  photos: Photo[];
  onDelete: (photoId: string) => Promise<void>;
  onUpdateCaption: (photoId: string, caption: string) => Promise<void>;
  onReorder?: (photoIds: string[]) => Promise<void>;
  deleting?: boolean;
  updating?: boolean;
  currentUserId?: string; // 追加：現在のユーザーID
}

export function PhotoManagementSection({
  photos,
  onDelete,
  onUpdateCaption,
  onReorder,
  deleting = false,
  updating = false,
  currentUserId, // 追加
}: PhotoManagementSectionProps) {
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);

  const handleStartEdit = (photo: Photo) => {
    setEditingPhotoId(photo.id);
    setEditCaption(photo.title || "");
  };

  const handleCancelEdit = () => {
    setEditingPhotoId(null);
    setEditCaption("");
  };

  const handleSaveEdit = async (photoId: string) => {
    await onUpdateCaption(photoId, editCaption);
    setEditingPhotoId(null);
    setEditCaption("");
  };

  const handleDragStart = (photoId: string) => {
    setDraggedPhotoId(photoId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetPhotoId: string) => {
    e.preventDefault();
    if (!draggedPhotoId || !onReorder) return;

    const draggedIndex = photos.findIndex((p) => p.id === draggedPhotoId);
    const targetIndex = photos.findIndex((p) => p.id === targetPhotoId);

    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
      setDraggedPhotoId(null);
      return;
    }

    const newPhotos = [...photos];
    const [removed] = newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(targetIndex, 0, removed);

    const newPhotoIds = newPhotos.map((p) => p.id);
    await onReorder(newPhotoIds);
    setDraggedPhotoId(null);
  };

  return (
    <Card className="border-2 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
            <Edit2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">写真の管理</CardTitle>
            <CardDescription className="mt-0.5">
              写真の削除、キャプション編集、並び替えができます
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">写真がありません。写真を追加すると、ここで管理できます。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {photos.map((photo, index) => {
              // 削除可能かどうかを判定
              const canDelete = currentUserId && photo.uploaderId === currentUserId;
              
              return (
                <div
                  key={photo.id}
                  draggable={!!onReorder}
                  onDragStart={() => handleDragStart(photo.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, photo.id)}
                  className={`flex flex-col lg:flex-row lg:items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    draggedPhotoId === photo.id
                      ? "border-blue-500 bg-blue-50 opacity-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
              {/* 上段（SP/タブレット）・左側（PC）：サムネイルと写真情報 */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* ドラッグハンドル */}
                {onReorder && (
                  <div className="cursor-move text-gray-400 hover:text-gray-600">
                    <GripVertical className="h-5 w-5" />
                  </div>
                )}

                {/* サムネイル */}
                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={photo.thumbnail}
                    alt={photo.title || "Photo"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 写真情報 */}
                <div className="flex-1 min-w-0">
                  {editingPhotoId === photo.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        placeholder="キャプションを入力..."
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        size="default"
                        onClick={() => handleSaveEdit(photo.id)}
                        disabled={updating}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="default"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={updating}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {photo.title || "（キャプションなし）"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(photo.uploadedAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 下段（SP/タブレット）・右側（PC）：アクションボタン */}
              {editingPhotoId !== photo.id && (
                <div className="flex items-center justify-end gap-2 lg:justify-end lg:flex-shrink-0 pl-0 sm:pl-[calc(1.5rem+64px)] lg:pl-0">
                  <Button
                    size="default"
                    variant="outline"
                    onClick={() => handleStartEdit(photo)}
                    disabled={updating}
                    className="gap-2 px-4"
                  >
                    <Edit2 className="h-4 w-4" />
                    編集
                  </Button>
                  {/* 削除ボタンは投稿者本人のみ表示 */}
                  {canDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="default"
                          variant="destructive"
                          disabled={deleting}
                          className="gap-2 px-4 bg-red-600 hover:bg-red-700 text-white border-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          削除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>写真を削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            この操作は取り消すことができません。写真が完全に削除されます。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(photo.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            削除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

