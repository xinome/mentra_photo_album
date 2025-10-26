"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mentra Photo Album
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            思い出を大切な人と共有するフォトアルバムアプリケーション
          </p>
          <div className="space-y-4">
            <button
              onClick={() => router.push("/login")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ログイン
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
