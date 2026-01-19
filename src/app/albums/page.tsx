import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AlbumsListClient } from '@/components/AlbumsListClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/Header';

// 動的レンダリングを強制（認証が必要なページのため）
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'アルバム一覧 | Mentra Photo Album',
  description: '全てのアルバムを表示',
};

async function getAllAlbums() {
  const supabase = await createClient();
  
  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  
  // 全アルバムを取得
  const { data: albums, error } = await supabase
    .from('albums')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('アルバム取得エラー:', error);
    return [];
  }
  
  // アルバムデータを整形
  const formattedAlbums = await Promise.all(
    (albums || []).map(async (album: any) => {
      // 写真数を取得
      const { count } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('album_id', album.id);
      const photoCount = count ?? 0;
      
      // カバー画像を取得
      let coverImage = "https://images.unsplash.com/photo-1587955793432-7c4ff80918ba?w=400";
      if (photoCount > 0) {
        const { data: firstPhoto } = await supabase
          .from('photos')
          .select('storage_key')
          .eq('album_id', album.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();
        
        if (firstPhoto) {
          // storage_keyがURLの場合は直接使用、それ以外はStorageから取得
          const photoKey = (firstPhoto as any).storage_key;
          if (photoKey?.startsWith('http')) {
            coverImage = photoKey;
          } else {
            const { data: signedUrl } = await supabase.storage
              .from('photos')
              .createSignedUrl(photoKey, 3600);
            if (signedUrl) {
              coverImage = signedUrl.signedUrl;
            }
          }
        }
      }
      
      return {
        id: album.id,
        title: album.title,
        description: album.description || 'アルバムの説明',
        coverImage,
        photoCount,
        createdAt: album.created_at,
        category: (album.category as 'wedding' | 'event' | 'family' | 'sports' | 'other') || 'other',
        isShared: album.is_public || false,
      };
    })
  );
  
  return formattedAlbums;
}

export default async function AlbumsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const albums = await getAllAlbums();
  
  // プロフィール情報を取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('user_id', user.id)
    .single() as { data: { display_name?: string; avatar_url?: string } | null };
  
  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={{
          name: profile?.display_name || user.email?.split('@')[0] || 'ユーザー',
          email: user.email || '',
          avatar: profile?.avatar_url,
        }}
      />
      <Suspense fallback={<AlbumsListSkeleton />}>
        <AlbumsListClient albums={albums} />
      </Suspense>
    </div>
  );
}

const AlbumsListSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-12 w-64 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
    </div>
  );
};
