/**
 * アプリケーション設定
 * 環境変数やデプロイURLの設定を一元管理
 */

/**
 * 現在の環境に応じたベースURLを取得
 * - ブラウザ環境: `location.origin`を使用して自動検出
 * - サーバー環境: 環境変数から取得（フォールバックあり）
 */
export const getBaseUrl = (): string => {
  // ブラウザ環境の場合
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // サーバー環境の場合
  // Vercelの場合: VERCEL_URL環境変数が利用可能
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  // デフォルト: 環境変数から取得、なければ適切なフォールバック
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

/**
 * Magic Link認証後のリダイレクト先URLを取得
 * 環境に応じて自動的に適切なURLを返す
 * 認証コールバックページにリダイレクトし、プロフィールチェック後に適切なページへ遷移する
 * 
 * 注意: ブラウザ環境では必ず現在のURLベースを使用します
 * localhost開発環境でも正しく動作するように、動的にURLを生成します
 */
export const getAuthRedirectUrl = (): string => {
  // ブラウザ環境の場合は必ず現在のURLを使用（localhost対応）
  if (typeof window !== 'undefined') {
    // 現在のURLから origin を取得（プロトコル、ホスト、ポートを含む）
    const baseUrl = window.location.origin;
    const redirectUrl = `${baseUrl}/auth/callback`;
    
    // デバッグログ（本番環境では削除推奨）
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] Magic LinkリダイレクトURL:', redirectUrl);
      console.log('[Auth] 現在のURL:', window.location.href);
    }
    
    return redirectUrl;
  }

  // サーバー環境の場合（通常は使用されないが、念のため）
  // 開発環境ではlocalhostを使用
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000/auth/callback';
  }
  
  const baseUrl = getBaseUrl();
  return `${baseUrl}/auth/callback`;
};

/**
 * サイトのベースURL（公開用）
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://mentra-photo-album.vercel.app';
