"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// ダミー環境のチェック用
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初期セッション取得
    const getInitialSession = async () => {
      console.log("AuthProvider: 初期セッション取得開始");
      try {
        // ダミー値の場合は認証をスキップ
        if (supabaseUrl === "https://dummy.supabase.co") {
          console.log("AuthProvider: ダミー環境のため認証をスキップ");
          setUser(null);
          setLoading(false);
          return;
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("AuthProvider: 初期セッション取得結果", { session, error });
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("AuthProvider: セッション取得エラー", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // URLハッシュから認証情報を処理（Magic Link認証後）
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        console.log("AuthProvider: URLから認証情報を検出", { accessToken: accessToken.substring(0, 20) + '...' });
        
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        console.log("AuthProvider: セッション設定結果", { data, error });
        
        // URLからハッシュをクリア
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    // 認証コールバック処理
    handleAuthCallback();
    
    // 初期セッション取得
    getInitialSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider: 認証状態変更", { event, session });
        setUser(session?.user ?? null);
        setLoading(false);
        
        // SIGNED_INイベントの場合は少し待ってからセッションを再取得
        if (event === 'SIGNED_IN') {
          setTimeout(async () => {
            const { data: { session: updatedSession } } = await supabase.auth.getSession();
            console.log("AuthProvider: サインイン後のセッション再取得", updatedSession);
            setUser(updatedSession?.user ?? null);
          }, 100);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
