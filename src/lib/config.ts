/**
 * アプリケーション設定
 * 環境変数やデプロイURLの設定を一元管理
 */

/**
 * 現在の環境に応じたベースURLを取得
 * - ブラウザ環境: `location.origin`を使用して自動検出
 * - サーバー環境: 環境変数から取得（フォールバックあり）
 */
export function getBaseUrl(): string {
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
}

/**
 * Magic Link認証後のリダイレクト先URLを取得
 * 環境に応じて自動的に適切なURLを返す
 */
export function getAuthRedirectUrl(): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/albums`;
}

/**
 * サイトのベースURL（公開用）
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://mentra-photo-album.vercel.app';
