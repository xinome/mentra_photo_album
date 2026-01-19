"use client";

import { useState } from "react";
import { Folder, Image as ImageIcon, Calendar, Trash2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import Link from "next/link";

interface AlbumStorage {
  id: string;
  title: string;
  description: string | null;
  coverImage: string;
  photoCount: number;
  totalSize: number; // バイト単位
  createdAt: string;
  updatedAt: string;
}

interface AlbumStorageSectionProps {
  albums: AlbumStorage[];
  loading?: boolean;
  totalStorage: number;
  onDeleteAlbum?: (albumId: string) => Promise<void>;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const AlbumStorageSection = ({
  albums,
  loading = false,
  totalStorage,
  onDeleteAlbum,
  searchQuery = "",
  onSearchChange,
}: AlbumStorageSectionProps) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // ファイルサイズをフォーマット
  const formatBytes = (bytes: number): { value: number; unit: string } => {
    if (bytes === 0) return { value: 0, unit: "B" };
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return {
      value: parseFloat((bytes / Math.pow(k, i)).toFixed(2)),
      unit: sizes[i],
    };
  };

  // 日時をフォーマット
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  // 検索でフィルタリング
  const filteredAlbums = albums.filter((album) => {
    if (!localSearchQuery) return true;
    const query = localSearchQuery.toLowerCase();
    return (
      album.title.toLowerCase().includes(query) ||
      (album.description?.toLowerCase().includes(query) ?? false)
    );
  });

  // 使用率を計算
  const getUsagePercentage = (size: number): number => {
    if (totalStorage === 0) return 0;
    return (size / totalStorage) * 100;
  };

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    onSearchChange?.(value);
  };

  if (loading) {
    return (
      <Card className="border-2 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>アルバム別ストレージ使用量</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
            <Folder className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">アルバム別ストレージ使用量</CardTitle>
            <CardDescription className="mt-0.5">
              アルバムごとのストレージ使用状況を確認できます
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 検索 */}
          <Input
            placeholder="アルバム名で検索..."
            value={localSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="border-2"
          />

          {/* アルバム一覧 */}
          {filteredAlbums.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Folder className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">アルバムが見つかりません</p>
              <p className="text-sm text-gray-500 mt-1">
                {localSearchQuery ? "検索条件を変更してください" : "まだアルバムが作成されていません"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlbums.map((album) => {
                const sizeInfo = formatBytes(album.totalSize);
                const usagePercentage = getUsagePercentage(album.totalSize);

                return (
                  <div
                    key={album.id}
                    className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors bg-white"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                      {/* カバー画像 */}
                      <Link href={`/albums/${album.id}`} className="flex-shrink-0">
                        <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-gray-100 relative group">
                          <ImageWithFallback
                            src={album.coverImage}
                            alt={album.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </Link>

                      {/* アルバム情報 */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <Link href={`/albums/${album.id}`}>
                              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                {album.title}
                              </h3>
                            </Link>
                            {album.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {album.description}
                              </p>
                            )}
                          </div>
                          {onDeleteAlbum && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteAlbum(album.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {/* ストレージ使用量 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-gray-700">
                                <ImageIcon className="h-4 w-4" />
                                <span>{album.photoCount} 枚</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-700">
                                <Folder className="h-4 w-4" />
                                <span className="font-semibold">
                                  {sizeInfo.value} {sizeInfo.unit}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(album.updatedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <Progress
                            value={usagePercentage}
                            className="h-2 bg-gray-200"
                          />
                          <div className="text-xs text-gray-500">
                            ストレージ全体の {usagePercentage.toFixed(1)}% を使用
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* アルバム数表示 */}
          {filteredAlbums.length > 0 && (
            <div className="text-sm text-gray-600 text-center pt-2 border-t">
              {filteredAlbums.length} 件のアルバムを表示
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

