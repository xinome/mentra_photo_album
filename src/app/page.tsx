"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Heart, Users, Sparkles } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // 認証済みユーザーはアルバムページにリダイレクト
      router.push("/albums");
    }
  }, [user, loading, router]);

  return (
    <AuthGuard requireAuth={false} redirectTo="/login">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <Sparkles className="h-4 w-4" />
                思い出を大切に
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Mentra Photo Album
              </h1>
              
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                大切な思い出を美しく整理し、<br />
                愛する人たちと共有するフォトアルバムアプリケーション
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push("/login")}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  ログインして始める
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 hover:border-gray-400 px-8 py-4 text-lg rounded-xl"
                >
                  デモを見る
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              なぜMentra Photo Albumなのか？
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              写真の整理から共有まで、すべてが簡単に
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  美しいアルバム作成
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  結婚式、イベント、家族の思い出など、あらゆる場面の写真を美しく整理できます。
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  簡単共有
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  ワンクリックで大切な人たちとアルバムを共有。みんなで思い出を楽しめます。
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  思い出を大切に
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  高品質な写真保存とバックアップで、大切な思い出を永続的に保存できます。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              今すぐ始めませんか？
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              無料でアカウントを作成して、美しいフォトアルバムを作りましょう
            </p>
            <Button
              onClick={() => router.push("/login")}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              無料で始める
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
