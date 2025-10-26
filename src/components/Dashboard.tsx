"use client";

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

interface DashboardProps {
  albums: Album[];
  onCreateAlbum: () => void;
  onOpenAlbum: (albumId: string) => void;
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

export function Dashboard({ albums, onCreateAlbum, onOpenAlbum }: DashboardProps) {
  const recentAlbums = albums.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-medium text-gray-900 mb-4">
              写真アルバムへようこそ
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              大切な思い出を整理して、みんなで共有しましょう。
              結婚式、イベント、部活動など、あらゆる場面の写真を簡単にアルバム化できます。
            </p>
            <Button onClick={onCreateAlbum} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              新しいアルバムを作成
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">総アルバム数</p>
                  <p className="text-2xl font-semibold">{albums.length}</p>
                </div>
                <Camera className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">総写真数</p>
                  <p className="text-2xl font-semibold">
                    {albums.reduce((sum, album) => sum + album.photoCount, 0)}
                  </p>
                </div>
                <Heart className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">共有中</p>
                  <p className="text-2xl font-semibold">
                    {albums.filter(album => album.isShared).length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Albums */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium">最近のアルバム</h2>
            {albums.length > 6 && (
              <Button variant="outline">すべて表示</Button>
            )}
          </div>

          {albums.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  まだアルバムがありません
                </h3>
                <p className="text-gray-600 mb-6">
                  最初のアルバムを作成して、写真の整理を始めましょう。
                </p>
                <Button onClick={onCreateAlbum} className="gap-2">
                  <Plus className="h-4 w-4" />
                  アルバムを作成
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentAlbums.map((album) => (
                <Card
                  key={album.id}
                  className="group cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onOpenAlbum(album.id)}
                >
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <ImageWithFallback
                      src={album.coverImage}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={categoryColors[album.category]}>
                        {categoryLabels[album.category]}
                      </Badge>
                    </div>
                    {album.isShared && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-white/90 text-gray-700">
                          <Users className="h-3 w-3 mr-1" />
                          共有中
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-1">
                      {album.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mb-3">
                      {album.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Camera className="h-4 w-4" />
                        {album.photoCount}枚
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(album.createdAt).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                新しいアルバム
              </CardTitle>
              <CardDescription>
                写真をアップロードして新しいアルバムを作成します
              </CardDescription>
            </CardHeader>
            <Button onClick={onCreateAlbum} className="w-full">
              アルバムを作成
            </Button>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                共有を管理
              </CardTitle>
              <CardDescription>
                アルバムの共有設定を変更します
              </CardDescription>
            </CardHeader>
            <Button variant="outline" className="w-full">
              共有設定
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}