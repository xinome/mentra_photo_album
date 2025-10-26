"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Profile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export default function AccountPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // プロファイル情報の取得
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        console.log("AccountPage: プロファイル取得開始", user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        console.log("AccountPage: プロファイル取得結果", { data, error });

        if (error && error.code !== 'PGRST116') { // PGRST116 = 行が見つからない
          console.error('プロファイル取得エラー:', error);
          setMessage({ type: 'error', text: 'プロファイルの取得に失敗しました' });
          return;
        }

        // プロファイルが存在しない場合は新規作成用のデータを準備
        setProfile(data || {
          user_id: user.id,
          display_name: null,
          avatar_url: null,
          created_at: new Date().toISOString()
        });
      } catch (err) {
        console.error('プロファイル取得エラー:', err);
        setMessage({ type: 'error', text: 'プロファイルの取得に失敗しました' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // プロファイル更新
  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !profile) return;

    setSaving(true);
    setMessage(null);

    try {
      const formData = new FormData(e.currentTarget);
      const displayName = formData.get('display_name') as string;

      console.log("AccountPage: プロファイル更新開始", { displayName });

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName || null,
          updated_at: new Date().toISOString()
        });

      console.log("AccountPage: プロファイル更新結果", { error });

      if (error) {
        console.error('プロファイル更新エラー:', error);
        setMessage({ type: 'error', text: 'プロファイルの更新に失敗しました' });
        return;
      }

      setMessage({ type: 'success', text: 'プロファイルを更新しました' });
      setProfile(prev => prev ? { ...prev, display_name: displayName || null } : null);
    } catch (err) {
      console.error('プロファイル更新エラー:', err);
      setMessage({ type: 'error', text: 'プロファイルの更新に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  // パスワード変更
  const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const formData = new FormData(e.currentTarget);
      const password = formData.get('password') as string;

      console.log("AccountPage: パスワード変更開始");

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      console.log("AccountPage: パスワード変更結果", { error });

      if (error) {
        console.error('パスワード変更エラー:', error);
        setMessage({ type: 'error', text: 'パスワードの変更に失敗しました' });
        return;
      }

      setMessage({ type: 'success', text: 'パスワードを変更しました' });
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error('パスワード変更エラー:', err);
      setMessage({ type: 'error', text: 'パスワードの変更に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <main className="mx-auto max-w-2xl p-6 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">アカウント設定</h1>
          <Link
            href="/albums" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← アルバムに戻る
          </Link>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className={`p-4 rounded ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* 基本情報セクション */}
        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">基本情報</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                メールアドレスは変更できません
              </p>
            </div>

            <form onSubmit={updateProfile}>
              <div>
                <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-1">
                  表示名
                </label>
                <input
                  type="text"
                  id="display_name"
                  name="display_name"
                  defaultValue={profile?.display_name || ''}
                  placeholder="表示名を入力"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </form>
          </div>
        </section>

        {/* セキュリティセクション */}
        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">セキュリティ</h2>
          
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                新しいパスワード
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength={6}
                placeholder="新しいパスワードを入力"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                6文字以上で入力してください
              </p>
            </div>
            
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '変更中...' : 'パスワードを変更'}
            </button>
          </form>
        </section>

        {/* アカウント情報セクション */}
        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">アカウント情報</h2>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>ユーザーID:</span>
              <span className="font-mono text-xs">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span>アカウント作成日:</span>
              <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString('ja-JP') : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>最終ログイン:</span>
              <span>{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('ja-JP') : '-'}</span>
            </div>
          </div>
        </section>
      </main>
    </AuthGuard>
  );
}
