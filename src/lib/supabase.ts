import { createClient } from "@supabase/supabase-js";

// 開発環境用のダミー値
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";

// 環境変数が設定されていない場合は警告を表示
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('NEXT_PUBLIC_SUPABASE_URL is not set. Using dummy value.');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Using dummy value.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 認証状態の永続化を有効化
    persistSession: true,
    // 自動リフレッシュを有効化
    autoRefreshToken: true,
    // セッションの永続化にlocalStorageを使用
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // 認証状態の変更を検出
    detectSessionInUrl: true,
  },
  // デバッグ用のログを有効化（開発時のみ）
  ...(process.env.NODE_ENV === 'development' && {
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web',
      },
    },
  }),
});