"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { ProfileSetup } from "@/components/ProfileSetup";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        // ログインしていない場合はログインページへ
        router.push("/login");
        return;
      }

      // プロフィールが既に存在するか確認
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile && profile.display_name) {
        // プロフィールが既に設定されている場合はアルバムページへ
        router.push("/albums");
      } else {
        setChecking(false);
      }
    };

    if (!loading) {
      checkProfile();
    }
  }, [user, loading, router]);

  const handleComplete = async (profileData: {
    displayName: string;
    avatar?: string;
    bio?: string;
  }) => {
    if (!user) {
      console.error("プロフィール保存エラー: ユーザーが見つかりません");
      alert("ユーザー情報が見つかりません。再度ログインしてください。");
      return;
    }

    console.log("プロフィール保存開始:", {
      user_id: user.id,
      display_name: profileData.displayName,
      has_avatar: !!profileData.avatar,
      has_bio: !!profileData.bio,
    });

    try {
      // プロフィールを保存
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          display_name: profileData.displayName,
          avatar_url: profileData.avatar || null,
          bio: profileData.bio || null,
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error("プロフィール保存エラー（詳細）:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        
        // エラーメッセージを詳細に表示
        let errorMessage = "プロフィールの保存に失敗しました";
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          errorMessage += "\n\nデータベーステーブルが作成されていません。\nセットアップガイドを参照してください。";
        } else if (error.message.includes("permission")) {
          errorMessage += "\n\n権限エラーが発生しました。\nデータベースのRLS設定を確認してください。";
        } else {
          errorMessage += `\n\nエラー: ${error.message}`;
        }
        
        alert(errorMessage);
        return;
      }

      console.log("プロフィール保存成功:", data);
      
      // アルバムページにリダイレクト
      router.push("/albums");
    } catch (err) {
      console.error("プロフィール保存エラー（予期しないエラー）:", err);
      alert("予期しないエラーが発生しました。コンソールログを確認してください。");
    }
  };

  const handleSkip = () => {
    // スキップした場合もアルバムページへ
    router.push("/albums");
  };

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <ProfileSetup
      email={user?.email || ""}
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}

