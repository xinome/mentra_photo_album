import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
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