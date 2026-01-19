"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, Users, Heart, Camera } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
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

interface Stats {
  totalAlbums: number;
  totalPhotos: number;
  sharedAlbums: number;
}

interface DashboardClientProps {
  albums: Album[];
  stats: Stats;
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

export const DashboardClient = ({ albums, stats }: DashboardClientProps) => {
  const router = useRouter();
  const DISPLAY_LIMIT = 6;
  const displayedAlbums = albums.slice(0, DISPLAY_LIMIT);
  const hasMore = albums.length > DISPLAY_LIMIT;

  const handleCreateAlbum = () => {
    router.push("/albums/create");
  };

  const handleOpenAlbum = (albumId: string) => {
    router.push(`/albums/${albumId}`);
  };

  const handleViewAll = () => {
    router.push("/albums");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Camera className="h-4 w-4" />
              あなたのアルバム
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              写真アルバムへようこそ
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              大切な思い出を整理して、みんなで共有しましょう。<br />
              結婚式、イベント、部活動など、あらゆる場面の写真を簡単にアルバム化できます。
            </p>
            <Button 
              onClick={handleCreateAlbum} 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
            >
              <Plus className="h-5 w-5" />
              新しいアルバムを作成
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">総アルバム数</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalAlbums}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Camera className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">総写真数</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalPhotos}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">共有中</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.sharedAlbums}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Albums */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">最近のアルバム</h2>
            {hasMore && (
              <Button 
                variant="outline" 
                className="rounded-xl"
                onClick={handleViewAll}
              >
                すべて表示
              </Button>
            )}
          </div>

          {albums.length === 0 ? (
            <Card className="border-0 shadow-lg text-center py-16">
              <CardContent>
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  まだアルバムがありません
                </h3>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                  最初のアルバムを作成して、写真の整理を始めましょう。
                </p>
                <Button 
                  onClick={handleCreateAlbum} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
                >
                  <Plus className="h-5 w-5" />
                  アルバムを作成
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedAlbums.map((album) => (
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
                          <Users className="h-3 w-3 mr-1" />
                          共有中
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <CardTitle className="text-xl mb-3 line-clamp-1 font-bold">
                      {album.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mb-4 text-gray-600">
                      {album.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        <span className="font-medium">{album.photoCount}枚</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 p-8">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                新しいアルバム
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                写真をアップロードして新しいアルバムを作成します
              </CardDescription>
            </CardHeader>
            <Button 
              onClick={handleCreateAlbum} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              アルバムを作成
            </Button>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 p-8">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                共有を管理
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                アルバムの共有設定を変更します
              </CardDescription>
            </CardHeader>
            <Button 
              variant="outline" 
              className="w-full border-2 border-gray-300 hover:border-gray-400 py-3 rounded-xl"
            >
              共有設定
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

