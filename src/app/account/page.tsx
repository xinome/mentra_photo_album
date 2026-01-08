"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Snackbar } from "@/components/ui/snackbar";
import { ProfileSection } from "./components/ProfileSection";
import { SecuritySection } from "./components/SecuritySection";
import { AccountManagementSection } from "./components/AccountManagementSection";
import { PrivacySection } from "./components/PrivacySection";
import { DangerZoneSection } from "./components/DangerZoneSection";

interface Profile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export default function AccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // アバターURLを処理する関数（パスの場合は署名付きURLを生成）
  const processAvatarUrl = async (avatarUrl: string | null): Promise<string | null> => {
    if (!avatarUrl) return null;
    
    // 既にURLの場合はそのまま返す
    if (avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    
    // パスの場合は署名付きURLを生成
    if (avatarUrl.startsWith('avatars/')) {
      const { data: signedUrlData } = await supabase.storage
        .from('photos')
        .createSignedUrl(avatarUrl, 3600);
      
      return signedUrlData?.signedUrl || null;
    }
    
    return avatarUrl;
  };

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
        let profileData: Profile = data || {
          user_id: user.id,
          display_name: null,
          avatar_url: null,
          bio: null,
          created_at: new Date().toISOString()
        };

        // アバターURLを処理
        if (profileData.avatar_url) {
          const processedUrl = await processAvatarUrl(profileData.avatar_url);
          profileData = {
            ...profileData,
            avatar_url: processedUrl
          };
        }

        setProfile(profileData);
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
  const handleProfileUpdate = async (data: {
    displayName: string;
    bio: string;
    avatarFile?: File;
    removeAvatar?: boolean;
  }) => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      let avatarUrl = profile?.avatar_url || null;

      // アバター画像の削除
      if (data.removeAvatar && avatarUrl) {
        // 署名付きURLからパスを抽出するか、直接パスを使用
        let oldPath: string | null = null;
        
        // 署名付きURLの場合、パラメータを除去してパスを抽出
        if (avatarUrl.includes('avatars/')) {
          const urlParts = avatarUrl.split('avatars/');
          if (urlParts.length > 1) {
            const pathPart = urlParts[1].split('?')[0]; // クエリパラメータを除去
            oldPath = `avatars/${pathPart}`;
          }
        } else if (avatarUrl.startsWith('avatars/')) {
          oldPath = avatarUrl;
        }

        if (oldPath) {
          const { error: deleteError } = await supabase.storage
            .from('photos')
            .remove([oldPath]);
          
          if (deleteError) {
            console.warn('既存アバターの削除エラー（無視）:', deleteError);
          }
        }
        
        avatarUrl = null;
      }

      // アバター画像のアップロード
      if (data.avatarFile) {
        // 既存のアバターを削除（存在する場合）
        if (avatarUrl) {
          let oldPath: string | null = null;
          
          if (avatarUrl.includes('avatars/')) {
            const urlParts = avatarUrl.split('avatars/');
            if (urlParts.length > 1) {
              const pathPart = urlParts[1].split('?')[0];
              oldPath = `avatars/${pathPart}`;
            }
          } else if (avatarUrl.startsWith('avatars/')) {
            oldPath = avatarUrl;
          }

          if (oldPath) {
            const { error: deleteError } = await supabase.storage
              .from('photos')
              .remove([oldPath]);
            
            if (deleteError) {
              console.warn('既存アバターの削除エラー（無視）:', deleteError);
            }
          }
        }

        const fileExt = data.avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, data.avatarFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('アバターアップロードエラー:', uploadError);
          setMessage({ type: 'error', text: 'アバター画像のアップロードに失敗しました' });
          setSaving(false);
          return;
        }

        // 署名付きURLを取得（1年間有効）
        const { data: signedUrlData } = await supabase.storage
          .from('photos')
          .createSignedUrl(filePath, 31536000);

        avatarUrl = signedUrlData?.signedUrl || filePath;
      }

      // プロファイル更新
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: data.displayName || null,
          bio: data.bio || null,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString()
        } as any);

      if (error) {
        console.error('プロファイル更新エラー:', error);
        setMessage({ type: 'error', text: 'プロファイルの更新に失敗しました' });
        return;
      }

      setMessage({ type: 'success', text: 'プロファイルを更新しました' });
      
      // プロファイルを更新
      const updatedProfile = {
        ...profile!,
        display_name: data.displayName || null,
        bio: data.bio || null,
        avatar_url: avatarUrl,
      };
      setProfile(updatedProfile);
      
      // アバター画像のプレビューを更新（ProfileSectionコンポーネントに反映される）
      // コンポーネントの再レンダリングで自動的に反映されます
    } catch (err) {
      console.error('プロファイル更新エラー:', err);
      setMessage({ type: 'error', text: 'プロファイルの更新に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  // パスワード変更
  const handlePasswordChange = async (password: string) => {
    setSaving(true);
    setMessage(null);

    try {
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
    } catch (err) {
      console.error('パスワード変更エラー:', err);
      setMessage({ type: 'error', text: 'パスワードの変更に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  // プライバシー設定更新
  const handlePrivacyUpdate = async (settings: {
    profileVisibility: boolean;
    dataSharing: boolean;
  }) => {
    // 将来的にデータベースに保存する場合はここで実装
    console.log("プライバシー設定更新:", settings);
    setMessage({ type: 'success', text: 'プライバシー設定を更新しました' });
  };

  // アカウント削除
  const handleDeleteAccount = async (confirmText: string) => {
    if (confirmText !== "削除") {
      setMessage({ type: 'error', text: '確認テキストが正しくありません' });
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      if (!user?.id) {
        setMessage({ type: 'error', text: 'ユーザー情報が見つかりません' });
        return;
      }

      // プロフィールを削除
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) {
        console.error('プロフィール削除エラー:', profileError);
      }

      // 注意: Supabase Authのアカウント削除はサーバーサイドでのみ可能です
      // クライアントサイドでは、プロフィールとデータを削除してからログアウトします
      // 完全なアカウント削除が必要な場合は、サーバーサイドのAPIエンドポイントを作成してください

      setMessage({ 
        type: 'success', 
        text: 'プロフィールデータを削除しました。アカウントの完全削除についてはサポートにお問い合わせください。' 
      });

      // 3秒後にログアウト
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push('/login');
      }, 3000);
    } catch (err) {
      console.error('アカウント削除エラー:', err);
      setMessage({ type: 'error', text: 'アカウントの削除に失敗しました' });
    } finally {
      setDeleting(false);
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header
          user={{
            name: profile?.display_name || user?.email?.split('@')[0] || 'ユーザー',
            email: user?.email || '',
            avatar: profile?.avatar_url || undefined,
          }}
          onLogout={handleLogout}
        />
        <main className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  アカウント設定
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  プロフィールとセキュリティ設定を管理
                </p>
              </div>
            </div>
            <Button variant="outline" asChild className="border-2 hover:bg-white/80">
              <Link href="/albums" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                アルバムに戻る
              </Link>
            </Button>
          </div>

          {/* Snackbarはページ最上部に固定表示されます */}
          {message && (
            <Snackbar
              message={{
                type: message.type,
                title: message.text,
              }}
              onClose={() => setMessage(null)}
              duration={3000}
            />
          )}

          {/* セクション */}
          <div className="space-y-6">
            <ProfileSection
              email={user?.email || ''}
              displayName={profile?.display_name || null}
              bio={profile?.bio || null}
              avatarUrl={profile?.avatar_url || null}
              onUpdate={handleProfileUpdate}
              saving={saving}
            />

            <SecuritySection
              onChangePassword={handlePasswordChange}
              saving={saving}
            />

            <AccountManagementSection
              userId={user?.id || ''}
              createdAt={user?.created_at || null}
              lastSignInAt={user?.last_sign_in_at || null}
            />

            <PrivacySection
              onPrivacyUpdate={handlePrivacyUpdate}
              saving={saving}
            />

            <DangerZoneSection
              onDeleteAccount={handleDeleteAccount}
              deleting={deleting}
            />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
