"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

/**
 * デバッグ用ページ
 * /albums にアクセスする前に、このページで接続状況を確認できます
 * 使い方: src/app/albums/page.tsx を一時的にこの内容に置き換えて確認
 */
export default function DebugAlbumsPage() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDebug = async () => {
      const info: any = {
        user: null,
        albums: null,
        photos: null,
        errors: [],
      };

      try {
        // 1. ユーザー情報確認
        console.log("🔍 Step 1: ユーザー情報確認");
        if (user) {
          info.user = {
            id: user.id,
            email: user.email,
          };
          console.log("✅ ユーザー情報:", info.user);
        } else {
          info.errors.push("ユーザーが見つかりません");
          console.error("❌ ユーザーが見つかりません");
        }

        // 2. Supabase接続確認
        console.log("🔍 Step 2: Supabase接続確認");
        const { data: testConnection, error: connectionError } = await supabase
          .from("albums")
          .select("count")
          .limit(1);
        
        if (connectionError) {
          info.errors.push(`接続エラー: ${connectionError.message}`);
          console.error("❌ 接続エラー:", connectionError);
        } else {
          console.log("✅ Supabase接続成功");
        }

        // 3. アルバム取得
        console.log("🔍 Step 3: アルバム取得");
        const { data: albumsData, error: albumsError } = await supabase
          .from("albums")
          .select("id,title,updated_at,description,owner_id")
          .order("updated_at", { ascending: false });

        if (albumsError) {
          info.errors.push(`アルバム取得エラー: ${albumsError.message}`);
          console.error("❌ アルバム取得エラー:", albumsError);
        } else {
          info.albums = {
            count: albumsData?.length || 0,
            data: albumsData,
          };
          console.log("✅ アルバム取得成功:", info.albums);
        }

        // 4. 写真取得
        console.log("🔍 Step 4: 写真取得");
        const { data: photosData, error: photosError } = await supabase
          .from("photos")
          .select("id,album_id,storage_key")
          .limit(5);

        if (photosError) {
          info.errors.push(`写真取得エラー: ${photosError.message}`);
          console.error("❌ 写真取得エラー:", photosError);
        } else {
          info.photos = {
            count: photosData?.length || 0,
            data: photosData,
          };
          console.log("✅ 写真取得成功:", info.photos);
        }

        // 5. RLSポリシー確認
        console.log("🔍 Step 5: RLSポリシー確認");
        if (user) {
          const { data: myAlbums, error: rlsError } = await supabase
            .from("albums")
            .select("id,title")
            .eq("owner_id", user.id);

          if (rlsError) {
            info.errors.push(`RLSエラー: ${rlsError.message}`);
            console.error("❌ RLSエラー:", rlsError);
          } else {
            info.myAlbumsCount = myAlbums?.length || 0;
            console.log("✅ 自分のアルバム数:", info.myAlbumsCount);
          }
        }

      } catch (error: any) {
        info.errors.push(`予期しないエラー: ${error.message}`);
        console.error("❌ 予期しないエラー:", error);
      }

      setDebugInfo(info);
      setLoading(false);
      console.log("📊 デバッグ情報まとめ:", info);
    };

    if (user !== undefined) {
      runDebug();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">デバッグ情報を取得中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 アルバムページデバッグ情報</h1>

        {/* エラー表示 */}
        {debugInfo.errors.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">❌ エラー</h2>
            <ul className="space-y-2">
              {debugInfo.errors.map((error: string, index: number) => (
                <li key={index} className="text-red-700">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ユーザー情報 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">👤 ユーザー情報</h2>
          {debugInfo.user ? (
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(debugInfo.user, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-600">ユーザーが見つかりません</p>
          )}
        </div>

        {/* アルバム情報 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📁 アルバム情報</h2>
          {debugInfo.albums ? (
            <>
              <p className="mb-4">
                <span className="font-medium">総数:</span> {debugInfo.albums.count}件
              </p>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto max-h-96">
                {JSON.stringify(debugInfo.albums.data, null, 2)}
              </pre>
            </>
          ) : (
            <p className="text-gray-600">アルバムが取得できませんでした</p>
          )}
        </div>

        {/* 写真情報 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📸 写真情報</h2>
          {debugInfo.photos ? (
            <>
              <p className="mb-4">
                <span className="font-medium">総数:</span> {debugInfo.photos.count}件
              </p>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto max-h-96">
                {JSON.stringify(debugInfo.photos.data, null, 2)}
              </pre>
            </>
          ) : (
            <p className="text-gray-600">写真が取得できませんでした</p>
          )}
        </div>

        {/* 成功メッセージ */}
        {debugInfo.errors.length === 0 && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              ✅ すべての接続が正常です！
            </h2>
            <p className="text-green-700 mb-4">
              Supabaseへの接続、データの取得が正常に動作しています。
            </p>
            <div className="space-y-2">
              <p>• アルバム数: {debugInfo.albums?.count || 0}件</p>
              <p>• 写真数: {debugInfo.photos?.count || 0}件</p>
              {debugInfo.myAlbumsCount !== undefined && (
                <p>• 自分のアルバム数: {debugInfo.myAlbumsCount}件</p>
              )}
            </div>
          </div>
        )}

        {/* 次のステップ */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            📝 次のステップ
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>上記のエラーがある場合は、それを解決してください</li>
            <li>エラーがない場合、元の page.tsx に戻してください</li>
            <li>ブラウザの拡張機能を無効化して試してください</li>
            <li>シークレット/プライベートウィンドウで試してください</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

