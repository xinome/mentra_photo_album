"use client";

import { useState } from "react";
import { Image, File, Trash2, Download, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

interface StorageFile {
  name: string;
  id: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
    cacheControl: string;
  };
  signedUrl?: string;
}

interface FileListSectionProps {
  files: StorageFile[];
  loading?: boolean;
  onDelete?: (filePath: string) => Promise<void>;
  onDownload?: (file: StorageFile) => Promise<void>;
  selectedFiles?: string[];
  onSelectFile?: (fileId: string) => void;
  onSelectAll?: () => void;
}

export const FileListSection = ({
  files,
  loading = false,
  onDelete,
  onDownload,
  selectedFiles = [],
  onSelectFile,
  onSelectAll,
}: FileListSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [filterType, setFilterType] = useState<string>("all");

  // ファイルサイズをフォーマット
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // 日時をフォーマット
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  // ファイルタイプを判定
  const getFileType = (mimetype: string): "image" | "document" | "other" => {
    if (mimetype?.startsWith("image/")) return "image";
    if (
      mimetype?.includes("pdf") ||
      mimetype?.includes("word") ||
      mimetype?.includes("text")
    )
      return "document";
    return "other";
  };

  // フィルタリングとソート
  const filteredAndSortedFiles = files
    .filter((file) => {
      // 検索クエリでフィルタ
      if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // ファイルタイプでフィルタ
      if (filterType !== "all") {
        const fileType = getFileType(file.metadata.mimetype);
        if (filterType !== fileType) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return b.metadata.size - a.metadata.size;
        case "date":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  if (loading) {
    return (
      <Card className="border-2 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>ファイル一覧</CardTitle>
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
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">ファイル一覧</CardTitle>
            <CardDescription className="mt-0.5">
              アップロードされたファイルを管理できます
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 検索・フィルター・ソート */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="ファイル名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-2"
            />
            {onSelectAll && filteredAndSortedFiles.length > 0 && (
              <Button
                variant="outline"
                onClick={onSelectAll}
                className="border-2"
              >
                {selectedFiles.length === filteredAndSortedFiles.length
                  ? "選択解除"
                  : "すべて選択"}
              </Button>
            )}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px] border-2">
                <SelectValue placeholder="ファイルタイプ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="image">画像</SelectItem>
                <SelectItem value="document">ドキュメント</SelectItem>
                <SelectItem value="other">その他</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-full sm:w-[180px] border-2">
                <SelectValue placeholder="並び替え" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">日時順</SelectItem>
                <SelectItem value="name">名前順</SelectItem>
                <SelectItem value="size">サイズ順</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ファイル一覧 */}
          {filteredAndSortedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <File className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">ファイルが見つかりません</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchQuery ? "検索条件を変更してください" : "まだファイルがアップロードされていません"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedFiles.map((file) => {
                const isImage = getFileType(file.metadata.mimetype) === "image";
                const isSelected = selectedFiles.includes(file.id);

                return (
                  <div
                    key={file.id}
                    className={`relative group border-2 rounded-lg overflow-hidden transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {/* サムネイル */}
                    <div className="aspect-square relative bg-gray-100">
                      {isImage && file.signedUrl ? (
                        <ImageWithFallback
                          src={file.signedUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <File className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      {/* オーバーレイアクション */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        {onDownload && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onDownload(file)}
                            className="bg-white/90 hover:bg-white"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDelete(file.name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* ファイル情報 */}
                    <div className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate flex-1">
                          {file.name}
                        </p>
                        {onSelectFile && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onSelectFile(file.id)}
                            className="mt-0.5"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <File className="h-3 w-3" />
                          <span>{formatBytes(file.metadata.size)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(file.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ファイル数表示 */}
          {filteredAndSortedFiles.length > 0 && (
            <div className="text-sm text-gray-600 text-center pt-2 border-t">
              {filteredAndSortedFiles.length} 件のファイルを表示
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

