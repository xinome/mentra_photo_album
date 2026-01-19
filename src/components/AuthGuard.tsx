"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export const AuthGuard = ({ 
  children, 
  redirectTo = "/login", 
  requireAuth = true 
}: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // ログインが必要だがユーザーがログインしていない場合
        router.push(redirectTo);
      } else if (!requireAuth && user) {
        // ログインが不要だがユーザーがログインしている場合（例：ログインページ）
        router.push("/albums");
      }
    }
  }, [user, loading, router, redirectTo, requireAuth]);

  // ローディング中は何も表示しない
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // 認証状態に応じてコンテンツを表示
  if (requireAuth && !user) {
    return null; // リダイレクト中は何も表示しない
  }

  if (!requireAuth && user) {
    return null; // リダイレクト中は何も表示しない
  }

  return <>{children}</>;
};
