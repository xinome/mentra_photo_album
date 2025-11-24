"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { AlbumCreator } from "@/components/AlbumCreator";
import { Header } from "@/components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, X, Settings } from "lucide-react";

interface DbAlbum {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
  description?: string;
  owner_id?: string;
}

interface DashboardAlbum {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  photoCount: number;
  createdAt: string;
  category: "wedding" | "event" | "family" | "sports" | "other";
  isShared: boolean;
}

// AlbumCreatorから渡されるデータ型
interface AlbumData {
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
  photos: File[];
}

type AlbumPageState = "dashboard" | "creating" | "viewing";

export default function AlbumsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [albums, setAlbums] = useState<DashboardAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileChecked, setProfileChecked] = useState(false);
  const [showProfileBanner, setShowProfileBanner] = useState(false);
  const [currentState, setCurrentState] = useState<AlbumPageState>("dashboard");
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  
  // デバッグ用: albumsの状態変更を監視
  useEffect(() => {
    console.log(`AlbumsPage: albums状態が更新されました: ${albums.length}件`);
    albums.forEach(album => {
      console.log(`AlbumsPage: - "${album.title}": ${album.photoCount}枚`);
    });
  }, [albums]);

  // プロフィールチェック（任意 - 警告バナーの表示のみ）
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;
      
      console.log("AlbumsPage: プロフィールチェック開始");
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      console.log("AlbumsPage: プロフィール確認結果", { profile, error });

      // プロフィールが存在しないか、display_nameが設定されていない場合
      // 強制リダイレクトはせず、警告バナーを表示
      if (!profile || !profile.display_name) {
        console.log("AlbumsPage: プロフィール未設定 - 警告バナーを表示");
        setShowProfileBanner(true);
      } else {
        setShowProfileBanner(false);
      }

      // プロフィールの有無に関わらず、アルバム機能は使用可能
      setProfileChecked(true);
    };

    if (user) {
      checkProfile();
    }
  }, [user]);

  // アルバム一覧を再取得する関数（外部定義）
    const fetchAlbums = async () => {
      if (!user || !profileChecked) return;
      
      console.log("AlbumsPage: ユーザー情報", user);
      console.log("AlbumsPage: ユーザーID", user.id);
      
      // owner_idでフィルタしてアルバムを取得（RLSポリシーでも保護されているが明示的にフィルタ）
      const { data: albumsData, error } = await supabase
        .from("albums")
        .select("id,title,updated_at,description,created_at,owner_id")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      console.log("AlbumsPage: アルバム取得結果", { albumsData, error, count: albumsData?.length });
      if (error) {
        console.error("AlbumsPage: アルバム取得エラー", error);
      }
      
      // データが存在しない場合はダミーデータを使用（開発・検証用）
      if (!albumsData || albumsData.length === 0) {
        console.log("AlbumsPage: アルバムデータが見つかりません。ダミーデータを表示します。");
        console.log("AlbumsPage: ヒント - Supabaseでサンプルデータを投入するには、supabase/sql/sample-data.sqlを実行してください");
        
        // ダミーデータ（開発・検証用）
        const dummyAlbums: DashboardAlbum[] = [
          {
            id: "dummy-1",
            title: "家族旅行 2024 沖縄",
            description: "2024年夏の沖縄旅行の思い出。美しいビーチと美味しい料理を楽しみました。",
            coverImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80",
            photoCount: 6,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            category: "family",
            isShared: false,
          },
          {
            id: "dummy-2",
            title: "田中家結婚式",
            description: "2024年春の素敵な結婚式。新郎新婦の幸せな笑顔が印象的でした。",
            coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80",
            photoCount: 8,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            category: "wedding",
            isShared: true,
          },
          {
            id: "dummy-3",
            title: "サッカー部春合宿 2024",
            description: "春合宿の楽しい思い出。チームワークが深まった3日間。",
            coverImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=80",
            photoCount: 7,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            category: "sports",
            isShared: false,
          },
          {
            id: "dummy-4",
            title: "大学卒業式",
            description: "4年間の思い出が詰まった卒業式。仲間との別れと新しい門出。",
            coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80",
            photoCount: 6,
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            category: "event",
            isShared: false,
          },
        ];
        
        setAlbums(dummyAlbums);
        setLoading(false);
        return;
      }
      
      if (albumsData) {
        // 各アルバムの写真数を取得
        const albumsWithDetails = await Promise.all(
          albumsData.map(async (album: DbAlbum) => {
            console.log(`AlbumsPage: アルバム "${album.title}" (${album.id}) の写真情報を取得中...`);
            console.log(`AlbumsPage: 現在のユーザーID: ${user.id}`);
            console.log(`AlbumsPage: アルバムのowner_id: ${album.owner_id}`);
            
            // 写真数を取得（countのみを取得 - より正確）
            // head: trueを使用してデータを取得せず、countのみを取得する
            // 注意: RLSポリシーにより、ユーザーがアクセス可能な写真のみがカウントされます
            const { count, error: countError } = await supabase
              .from("photos")
              .select("*", { count: "exact", head: true })
              .eq("album_id", album.id);

            // count取得の結果をログ出力
            if (countError) {
              console.error(`AlbumsPage: ❌ アルバム "${album.title}" (${album.id}) の写真数取得エラー`, countError);
              console.error(`AlbumsPage: 写真数取得エラー詳細:`, {
                message: countError.message,
                details: countError.details,
                hint: countError.hint,
                code: countError.code
              });
              console.error(`AlbumsPage: RLSポリシーの問題の可能性があります。ユーザーID: ${user.id}, アルバムowner_id: ${album.owner_id}`);
            } else {
              if (count === null) {
                console.warn(`AlbumsPage: ⚠️ アルバム "${album.title}" の写真数（count）が null です`);
              } else if (count === 0) {
                console.log(`AlbumsPage: ℹ️ アルバム "${album.title}" の写真数（count）: 0 - 写真データが存在しません`);
              } else {
                console.log(`AlbumsPage: ✅ アルバム "${album.title}" の写真数（count）: ${count}`);
                
                // countが異常に大きい場合（通常は10-100程度を想定）の警告
                if (count > 100) {
                  console.warn(`AlbumsPage: ⚠️ 警告 - アルバム "${album.title}" の写真数が異常に多いです（${count}件）。データの重複やRLSポリシーの問題の可能性があります。`);
                  console.warn(`AlbumsPage: 確認のため、Supabaseダッシュボードで以下のクエリを実行してください：`);
                  console.warn(`AlbumsPage: SELECT COUNT(*) FROM photos WHERE album_id = '${album.id}';`);
                }
              }
            }

            // 検証用: 実際に全写真データを取得してカウント（デバッグ用、本番環境では削除推奨）
            // 注意: パフォーマンスに影響する可能性があるため、デバッグ時のみ使用
            if (process.env.NODE_ENV === 'development' && count && count > 0) {
              const { data: allPhotosForVerification, error: verifyError } = await supabase
                .from("photos")
                .select("id, storage_key, created_at")
                .eq("album_id", album.id)
                .order("created_at", { ascending: true });
              
              if (!verifyError && allPhotosForVerification) {
                const actualCount = allPhotosForVerification.length;
                
                // countと実際のデータ数の一致確認
                if (actualCount !== count) {
                  console.error(`AlbumsPage: ❌ 不整合 - アルバム "${album.title}" でcount=${count}だが、実際のデータ数は${actualCount}件です`);
                  console.error(`AlbumsPage: RLSポリシーまたはクエリに問題がある可能性があります`);
                } else {
                  // データ数が一致していても、異常に多い場合は警告
                  if (actualCount > 20) {
                    console.warn(`AlbumsPage: ⚠️ データ数が異常に多いです - アルバム "${album.title}" の実際のデータ数: ${actualCount}件`);
                    console.warn(`AlbumsPage: サンプルデータは通常6-8件程度を想定しています。データの重複や複数回のINSERTの可能性があります。`);
                    console.warn(`AlbumsPage: クリーンアップ手順は docs/DATA_CLEANUP_GUIDE.md を参照してください。`);
                    console.warn(`AlbumsPage: または、Supabaseダッシュボードで以下のクエリを実行して確認してください：`);
                    console.warn(`AlbumsPage: SELECT id, storage_key, created_at FROM photos WHERE album_id = '${album.id}' ORDER BY created_at;`);
                    
                    // 重複チェック: 同じstorage_keyが複数存在するか
                    const storageKeyCounts = new Map<string, number>();
                    allPhotosForVerification.forEach(photo => {
                      const count = storageKeyCounts.get(photo.storage_key) || 0;
                      storageKeyCounts.set(photo.storage_key, count + 1);
                    });
                    
                    const duplicates = Array.from(storageKeyCounts.entries()).filter(([_, count]) => count > 1);
                    if (duplicates.length > 0) {
                      console.error(`AlbumsPage: ❌ 重複データを検出 - 同じstorage_keyが複数回存在します:`);
                      duplicates.forEach(([storageKey, count]) => {
                        console.error(`AlbumsPage:   - ${storageKey}: ${count}回`);
                      });
                      console.error(`AlbumsPage: クリーンアップスクリプト: supabase/sql/cleanup-duplicate-photos.sql を実行してください。`);
                      console.error(`AlbumsPage: 詳細な手順は docs/DATA_CLEANUP_GUIDE.md を参照してください。`);
                    }
                  } else {
                    console.log(`AlbumsPage: ✓ 検証OK - アルバム "${album.title}" のcount=${count}と実際のデータ数=${actualCount}が一致しています`);
                  }
                }
              }
            }

            // カバー画像用に最初の写真のみを取得
            const { data: firstPhoto, error: photoError } = await supabase
              .from("photos")
              .select("storage_key, album_id, uploader_id")
              .eq("album_id", album.id)
              .order("created_at", { ascending: true })
              .limit(1);

            // 写真取得の結果をログ出力
            if (photoError) {
              console.error(`AlbumsPage: ❌ アルバム "${album.title}" (${album.id}) の写真取得エラー`, photoError);
              console.error(`AlbumsPage: 写真取得エラー詳細:`, {
                message: photoError.message,
                details: photoError.details,
                hint: photoError.hint,
                code: photoError.code
              });
            } else {
              if (!firstPhoto || firstPhoto.length === 0) {
                console.log(`AlbumsPage: ℹ️ アルバム "${album.title}" の写真データ: 0件 - 写真が存在しません`);
              } else {
                console.log(`AlbumsPage: ✅ アルバム "${album.title}" の写真データ: ${firstPhoto.length}件`);
                console.log(`AlbumsPage: 最初の写真のstorage_key:`, firstPhoto[0].storage_key);
              }
            }

            // 写真数（countを優先、取得できなかった場合は0）
            const photoCount = count ?? 0;

            // countと実際のデータに差異がある場合の警告
            if (count !== null && count > 0 && (!firstPhoto || firstPhoto.length === 0)) {
              console.warn(`AlbumsPage: ⚠️ 警告 - アルバム "${album.title}" でcount=${count}だが、写真データが取得できません（RLSポリシーの問題の可能性）`);
            } else if (count === 0 && firstPhoto && firstPhoto.length > 0) {
              console.warn(`AlbumsPage: ⚠️ 警告 - アルバム "${album.title}" でcount=0だが、写真データが存在します`);
            }

            // RLSポリシーの動作確認ログ
            console.log(`AlbumsPage: 📊 RLSポリシー確認 - アルバム "${album.title}":`, {
              album_id: album.id,
              album_owner_id: album.owner_id,
              current_user_id: user.id,
              owner_id_matches: album.owner_id === user.id,
              count: count ?? 'null',
              photo_data_exists: firstPhoto && firstPhoto.length > 0 ? 'yes' : 'no'
            });

            // カバー画像を取得（最初の写真）
            let coverImage = "https://images.unsplash.com/photo-1587955793432-7c4ff80918ba?w=400";
            if (firstPhoto && firstPhoto.length > 0) {
              // storage_keyがURLの場合は直接使用、それ以外はStorageから取得
              if (firstPhoto[0].storage_key.startsWith('http')) {
                coverImage = firstPhoto[0].storage_key;
              } else {
                const { data: signedUrl } = await supabase.storage
                  .from("photos")
                  .createSignedUrl(firstPhoto[0].storage_key, 3600);
                if (signedUrl) {
                  coverImage = signedUrl.signedUrl;
                }
              }
            }

            const albumDetail = {
              id: album.id,
              title: album.title,
              description: album.description || "アルバムの説明",
              coverImage,
              photoCount: photoCount,
              createdAt: album.created_at || album.updated_at,
              category: "other" as const,
              isShared: false, // TODO: 共有情報を取得
            };
            
            console.log(`AlbumsPage: アルバム "${album.title}" の最終データ:`, {
              title: albumDetail.title,
              photoCount: albumDetail.photoCount,
              coverImage: albumDetail.coverImage.substring(0, 50) + '...'
            });
            
            return albumDetail;
          })
        );
        
        console.log(`AlbumsPage: 取得したアルバム数: ${albumsWithDetails.length}`);
        console.log(`AlbumsPage: アルバム一覧（写真数）:`, albumsWithDetails.map(a => ({
          title: a.title,
          photoCount: a.photoCount
        })));
        
        setAlbums(albumsWithDetails);
      }
      setLoading(false);
    };

  useEffect(() => {
    fetchAlbums();
  }, [user, profileChecked]);

  // アルバム作成画面に遷移（データ変更なし）
  const handleCreateAlbum = () => {
    setCurrentState("creating");
  };

  // アルバム作成画面から戻る
  const handleBackToDashboard = () => {
    setCurrentState("dashboard");
    setSelectedAlbumId(null);
  };

  // アルバムを保存（Supabase統合）
  const handleSaveAlbum = async (albumData: AlbumData) => {
    if (!user) return;
    
    try {
      console.log("AlbumsPage: アルバム保存開始", albumData);

      // 1. 写真をSupabase Storageにアップロード
      const uploadedPhotos: Array<{ storageKey: string; publicUrl: string }> = [];
      const baseTimestamp = Date.now();
      
      for (let i = 0; i < albumData.photos.length; i++) {
        const file = albumData.photos[i];
        // ファイル名を安全な形式に変換（日本語や特殊文字を除去）
        // 元のファイル名から拡張子を取得
        const originalName = file.name;
        const fileExtension = originalName.substring(originalName.lastIndexOf('.'));
        // ファイル名を安全な形式に変換（英数字、ハイフン、アンダースコアのみ許可）
        const sanitizedName = originalName
          .replace(/\.[^/.]+$/, '') // 拡張子を一時的に除去
          .replace(/[^a-zA-Z0-9_-]/g, '_') // 英数字以外をアンダースコアに置換
          .substring(0, 50) // 長さを制限
          + fileExtension; // 拡張子を追加
        
        // ファイル名の重複を防ぐため、タイムスタンプ + ランダム文字列 + インデックスを使用
        const randomSuffix = Math.random().toString(36).substring(2, 9);
        const fileName = `${user.id}/${baseTimestamp}-${randomSuffix}-${i}-${sanitizedName}`;
        
        console.log(`AlbumsPage: 写真アップロード中 (${i + 1}/${albumData.photos.length}): ${fileName}`);
        console.log(`AlbumsPage: 元のファイル名: ${originalName}`);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("photos")
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`AlbumsPage: 写真アップロードエラー (${i + 1}/${albumData.photos.length}):`, uploadError);
          console.error("AlbumsPage: エラー詳細:", {
            message: uploadError.message,
            name: uploadError.name
          });
          throw new Error(`写真のアップロードに失敗しました: ${uploadError.message}`);
        }

        // 署名付きURLを取得（Storageバケットがpublicでない場合）
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("photos")
          .createSignedUrl(fileName, 3600);

        if (signedUrlError) {
          console.warn("AlbumsPage: 署名付きURL取得エラー（アップロードは成功）:", signedUrlError);
        }

        uploadedPhotos.push({
          storageKey: fileName,
          publicUrl: signedUrlData?.signedUrl || ""
        });
      }

      console.log("AlbumsPage: 写真アップロード完了", uploadedPhotos.length, "件");

      // 2. albumsテーブルにアルバム情報を保存
      console.log("AlbumsPage: アルバム情報を保存中...", {
        title: albumData.title,
        description: albumData.description,
        is_public: albumData.isPublic,
        owner_id: user.id
      });
      
      const { data: album, error: albumError } = await supabase
      .from("albums")
      .insert({ 
          owner_id: user.id,
          title: albumData.title,
          description: albumData.description || null,
          is_public: albumData.isPublic,
      })
        .select()
        .single();

      if (albumError) {
        console.error("AlbumsPage: アルバム保存エラー", albumError);
        console.error("AlbumsPage: エラー詳細:", {
          message: albumError.message,
          details: albumError.details,
          hint: albumError.hint,
          code: albumError.code
        });
        throw new Error(`アルバムの保存に失敗しました: ${albumError.message}`);
      }

      console.log("AlbumsPage: アルバム保存完了", album.id);

      // 3. photosテーブルに写真情報を保存
      if (uploadedPhotos.length > 0) {
        console.log("AlbumsPage: 写真情報を保存中...", uploadedPhotos.length, "件");
        const photoInserts = uploadedPhotos.map((photo, index) => ({
          album_id: album.id,
          uploader_id: user.id,
          storage_key: photo.storageKey,
          mime_type: albumData.photos[index]?.type || null,
          bytes: albumData.photos[index]?.size || null,
        }));

        const { error: photosError } = await supabase
          .from("photos")
          .insert(photoInserts);

        if (photosError) {
          console.error("AlbumsPage: 写真情報保存エラー", photosError);
          console.error("AlbumsPage: エラー詳細:", {
            message: photosError.message,
            details: photosError.details,
            hint: photosError.hint,
            code: photosError.code
          });
          throw new Error(`写真情報の保存に失敗しました: ${photosError.message}`);
        }

        console.log("AlbumsPage: 写真情報保存完了", photoInserts.length, "件");
      }

      // 4. アルバム一覧を再取得
      await fetchAlbums();
      
      // 5. 作成したアルバムの詳細ページに遷移
      setSelectedAlbumId(album.id);
      setCurrentState("viewing");
      router.push(`/albums/${album.id}`);

    } catch (error) {
      console.error("AlbumsPage: アルバム作成エラー", error);
      const errorMessage = error instanceof Error ? error.message : "予期しないエラーが発生しました";
      console.error("AlbumsPage: エラーメッセージ:", errorMessage);
      alert(`アルバムの作成に失敗しました: ${errorMessage}`);
    }
  };

  const handleOpenAlbum = (albumId: string) => {
    router.push(`/albums/${albumId}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
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
      <div className="min-h-screen bg-background">
        {user && (
          <Header 
            user={{
              name: user.email?.split("@")[0] || "ユーザー",
              email: user.email || "",
            }}
            onLogout={handleLogout}
          />
        )}
        
        {/* プロフィール未設定警告バナー */}
        {showProfileBanner && (
          <div className="bg-background border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900 font-medium">
                  プロフィールを設定しましょう
                </AlertTitle>
                <AlertDescription className="text-blue-800 mt-2">
                  <p className="mb-3">
                    プロフィールを設定することで、より快適にアルバムを管理できます。
                    名前やアバターを設定して、あなたらしいアルバムを作りましょう。
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => router.push("/account/setup")}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      プロフィールを設定
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowProfileBanner(false)}
                      className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                    >
                      <X className="h-4 w-4 mr-2" />
                      閉じる
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {/* 条件分岐で画面を切り替え */}
        {currentState === "dashboard" && (
        <Dashboard
          albums={albums}
          onCreateAlbum={handleCreateAlbum}
          onOpenAlbum={handleOpenAlbum}
        />
        )}

        {currentState === "creating" && (
          <AlbumCreator
            onBack={handleBackToDashboard}
            onSave={handleSaveAlbum}
          />
        )}

        {/* viewing状態の場合は、既存のアルバム詳細ページへの遷移処理で対応 */}
        {currentState === "viewing" && selectedAlbumId && (
          // 既にrouter.pushで遷移しているため、ここでは何も表示しない
          // または、ローディング表示
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
