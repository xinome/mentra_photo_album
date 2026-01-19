"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, Camera, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Album {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  photoCount: number;
  createdAt: string;
  category: "wedding" | "event" | "family" | "sports" | "other";
  isShared: boolean;
}

interface AlbumsListClientProps {
  albums: Album[];
}

const categoryLabels = {
  wedding: "結婚式",
  event: "イベント",
  family: "家族",
  sports: "スポーツ",
  other: "その他",
};

const categoryColors = {
  wedding: "bg-pink-100 text-pink-800",
  event: "bg-blue-100 text-blue-800",
  family: "bg-green-100 text-green-800",
  sports: "bg-orange-100 text-orange-800",
  other: "bg-gray-100 text-gray-800",
};

type SortOption = "created_desc" | "created_asc" | "title_asc" | "title_desc";
type CategoryFilter = "all" | "wedding" | "event" | "family" | "sports" | "other";

export const AlbumsListClient = ({ albums }: AlbumsListClientProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("created_desc");

  const filteredAndSortedAlbums = useMemo(() => {
    let filtered = albums;

    // 検索フィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (album) =>
          album.title.toLowerCase().includes(query) ||
          album.description.toLowerCase().includes(query)
      );
    }

    // カテゴリフィルター
    if (categoryFilter !== "all") {
      filtered = filtered.filter((album) => album.category === categoryFilter);
    }

    // ソート
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "created_desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "created_asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title_asc":
          return a.title.localeCompare(b.title, "ja");
        case "title_desc":
          return b.title.localeCompare(a.title, "ja");
        default:
          return 0;
      }
    });

    return sorted;
  }, [albums, searchQuery, categoryFilter, sortOption]);

  const handleOpenAlbum = (albumId: string) => {
    router.push(`/albums/${albumId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">アルバム一覧</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {filteredAndSortedAlbums.length}件のアルバムが見つかりました
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4 md:space-y-0 md:flex md:gap-4">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="タイトル・説明で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2 shrink-0" />
              <SelectValue placeholder="カテゴリ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="wedding">結婚式</SelectItem>
              <SelectItem value="event">イベント</SelectItem>
              <SelectItem value="family">家族</SelectItem>
              <SelectItem value="sports">スポーツ</SelectItem>
              <SelectItem value="other">その他</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <ArrowUpDown className="h-4 w-4 mr-2 shrink-0" />
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_desc">作成日（新しい順）</SelectItem>
              <SelectItem value="created_asc">作成日（古い順）</SelectItem>
              <SelectItem value="title_asc">タイトル（あいうえお順）</SelectItem>
              <SelectItem value="title_desc">タイトル（逆順）</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Albums Grid */}
        {filteredAndSortedAlbums.length === 0 ? (
          <Card className="border-0 shadow-lg text-center py-12 sm:py-16">
            <CardContent>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                アルバムが見つかりませんでした
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                検索条件を変更して、もう一度お試しください。
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {filteredAndSortedAlbums.map((album) => (
              <Card
                key={album.id}
                className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                onClick={() => handleOpenAlbum(album.id)}
              >
                <div className="aspect-video relative overflow-hidden">
                  <ImageWithFallback
                    src={album.coverImage}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4">
                    <Badge className={`${categoryColors[album.category]} shadow-lg`}>
                      {categoryLabels[album.category]}
                    </Badge>
                  </div>
                  {album.isShared && (
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-700 shadow-lg">
                        共有中
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <CardTitle className="text-base sm:text-lg mb-2 line-clamp-1 font-bold">
                    {album.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mb-3 sm:mb-4 text-gray-600 text-xs sm:text-sm">
                    {album.description}
                  </CardDescription>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="font-medium truncate">{album.photoCount}枚</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="font-medium truncate text-xs sm:text-sm">
                        {new Date(album.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

