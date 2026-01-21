"use client";

import { useState } from "react";
import { ArrowLeft, Download, Share2, Heart, Calendar, Users, Camera, Grid, List, Search, Filter, Edit, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
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
} from "./ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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

interface AlbumViewerProps {
  album: Album;
  onBack: () => void;
  onShare: () => void;
  onDownload: () => void;
  onLikePhoto: (photoId: string) => void;
  onEdit?: () => void;
  canEdit?: boolean;
  onDelete?: () => void; // 追加：削除ハンドラ
  canDelete?: boolean; // 追加：削除可能かどうか
  deleting?: boolean; // 追加：削除中かどうか
}

const categoryLabels = {
  wedding: "結婚式",
  event: "イベント", 
  family: "家族",
  sports: "スポーツ",
  other: "その他",
};

export const AlbumViewer = ({ album, onBack, onShare, onDownload, onLikePhoto, onEdit, canEdit, onDelete, canDelete, deleting }: AlbumViewerProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const filteredPhotos = (() => {
    const filtered = album.photos.filter((photo) =>
      photo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.uploadedBy.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 手動順の場合はソートしない（album.photosの順序をそのまま使用）
    if (sortBy === "manual") {
      return filtered;
    }

    // それ以外の場合はソート
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case "oldest":
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case "likes":
          return b.likes - a.likes;
        default:
          return 0;
      }
    });
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 py-3 sm:py-0 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button variant="ghost" onClick={onBack} className="gap-2 shrink-0">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">戻る</span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-medium truncate">{album.title}</h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                  <Badge variant="outline" className="text-xs">{categoryLabels[album.category]}</Badge>
                  <span className="hidden sm:inline">•</span>
                  <span className="whitespace-nowrap">{album.photos.length}枚の写真</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {canEdit && onEdit && (
                <Button variant="outline" onClick={onEdit} size="sm" className="gap-1.5 sm:gap-2 flex-1 sm:flex-initial">
                  <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">編集</span>
                </Button>
              )}
              <Button variant="outline" onClick={onShare} size="sm" className="gap-1.5 sm:gap-2 flex-1 sm:flex-initial">
                <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">共有</span>
              </Button>
              <Button variant="outline" onClick={onDownload} size="sm" className="gap-1.5 sm:gap-2 flex-1 sm:flex-initial">
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">ダウンロード</span>
              </Button>
              {/* 削除ボタン（作成者本人のみ表示） */}
              {canDelete && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1.5 sm:gap-2 flex-1 sm:flex-initial text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      disabled={deleting}
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">削除</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>アルバムを削除しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        この操作は取り消すことができません。アルバムとすべての写真が完全に削除されます。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={deleting}
                      >
                        {deleting ? "削除中..." : "削除"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Album Info */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                <div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-2 sm:mb-3">{album.description}</p>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{new Date(album.createdAt).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{album.photos.length}枚</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{album.contributors.length}人が参加</span>
                    </div>
                  </div>
                </div>

                {album.contributors.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">参加者</h3>
                    <div className="flex items-center gap-2">
                      {album.contributors.slice(0, 5).map((contributor, index) => (
                        <Avatar key={index} className="h-8 w-8">
                          <AvatarImage src={contributor.avatar} alt={contributor.name} />
                          <AvatarFallback>
                            {contributor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {album.contributors.length > 5 && (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                          +{album.contributors.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="aspect-video relative overflow-hidden rounded-lg">
                <ImageWithFallback
                  src={album.coverImage}
                  alt={album.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="写真や投稿者を検索..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[140px] md:w-40">
                <Filter className="h-4 w-4 mr-2 shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">新しい順</SelectItem>
                <SelectItem value="oldest">古い順</SelectItem>
                <SelectItem value="manual">手動順</SelectItem>
                <SelectItem value="likes">いいね順</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md shrink-0">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none px-2 sm:px-3"
              >
                <Grid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none px-2 sm:px-3"
              >
                <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        {filteredPhotos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? "検索結果が見つかりません" : "写真がありません"}
              </h3>
              <p className="text-gray-600">
                {searchQuery ? "別のキーワードで検索してみてください" : "写真をアップロードしてください"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
              : "space-y-3 sm:space-y-4"
          }>
            {filteredPhotos.map((photo) => (
              <div key={photo.id}>
                {viewMode === "grid" ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="group cursor-pointer">
                        <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                          <ImageWithFallback
                            src={photo.thumbnail}
                            alt={photo.title || "Photo"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-end">
                            <div className="w-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1">
                                  <Heart className={`h-3 w-3 ${photo.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                  {photo.likes}
                                </div>
                                <span className="text-xs">
                                  {photo.uploadedBy.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl p-0">
                      <div className="relative">
                        <ImageWithFallback
                          src={photo.url}
                          alt={photo.title || "Photo"}
                          className="w-full h-auto max-h-[80vh] object-contain"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                          <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={photo.uploadedBy.avatar} alt={photo.uploadedBy.name} />
                                <AvatarFallback>
                                  {photo.uploadedBy.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{photo.uploadedBy.name}</p>
                                <p className="text-sm opacity-80">
                                  {new Date(photo.uploadedAt).toLocaleDateString('ja-JP')}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onLikePhoto(photo.id)}
                              className="text-white hover:bg-white/20 gap-2"
                            >
                              <Heart className={`h-4 w-4 ${photo.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                              {photo.likes}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 flex-shrink-0">
                          <ImageWithFallback
                            src={photo.thumbnail}
                            alt={photo.title || "Photo"}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={photo.uploadedBy.avatar} alt={photo.uploadedBy.name} />
                                <AvatarFallback>
                                  {photo.uploadedBy.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{photo.uploadedBy.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onLikePhoto(photo.id)}
                              className="gap-1"
                            >
                              <Heart className={`h-4 w-4 ${photo.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                              {photo.likes}
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(photo.uploadedAt).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};