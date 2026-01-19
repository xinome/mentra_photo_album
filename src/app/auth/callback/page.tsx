"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

// 動的レンダリングを強制（プリレンダリングを無効化）
export const dynamic = 'force-dynamic';

/**
 * 認証コールバックページ
 * Magic Link認証後のリダイレクト先
 * プロフィールチェックを行い、適切なページへ遷移する
 */
const AuthCallbackPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // 認証の読み込みが完了するまで待つ
      if (authLoading) {
        return;
      }

      // 認証されていない場合はログインページへ
      if (!user) {
        console.log("AuthCallbackPage: 認証されていないためログインページへ");
        router.push("/login");
        return;
      }

      try {
        console.log("AuthCallbackPage: プロフィールチェック開始", { userId: user.id });

        // プロフィールが存在するか確認
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        console.log("AuthCallbackPage: プロフィール確認結果", { profile, profileError });

        // プロフィールが存在しないか、display_nameが設定されていない場合
        if (!profile || !(profile as any).display_name) {
          console.log("AuthCallbackPage: プロフィール未設定 - プロフィール設定ページへ");
          router.push("/account/setup");
          return;
        }

        // プロフィール設定済みの場合はダッシュボードへ
        console.log("AuthCallbackPage: プロフィール設定済み - ダッシュボードへ");
        router.push("/dashboard");
      } catch (err) {
        console.error("AuthCallbackPage: エラー", err);
        setError("プロフィールの確認中にエラーが発生しました。もう一度お試しください。");
        // エラー時は安全のためダッシュボードへ
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } finally {
        setChecking(false);
      }
    };

    handleAuthCallback();
  }, [user, authLoading, router]);

  // ローディング中
  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">認証を確認しています...</p>
        </div>
      </div>
    );
  }

  // エラー時
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">エラーが発生しました</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <p className="text-gray-600 text-sm">しばらくお待ちください...</p>
        </div>
      </div>
    );
  }

  // 上記のいずれでもない場合（リダイレクト処理中）
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600">リダイレクト中...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;

