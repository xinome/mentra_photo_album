import { AuthError } from "@supabase/supabase-js";

/**
 * Supabase Authエラーをユーザーフレンドリーな日本語メッセージに変換
 */
export function getAuthErrorMessage(error: AuthError | null): string {
  if (!error) {
    return "";
  }

  // Supabaseのエラーコードに基づいてメッセージを返す
  switch (error.message) {
    case "Invalid email":
    case "Email rate limit exceeded":
      return "メールアドレスの形式が正しくありません。正しいメールアドレスを入力してください。";
    
    case "For security purposes, you can only request this once every 60 seconds":
      return "セキュリティのため、60秒間に1回までしかリクエストできません。しばらく待ってから再度お試しください。";
    
    case "Email not confirmed":
      return "メールアドレスの確認が完了していません。メールボックスを確認してください。";
    
    case "User already registered":
      return "このメールアドレスは既に登録されています。メールボックスを確認してログインリンクをクリックしてください。";
    
    case "Signup is disabled":
      return "現在、新規登録を受け付けていません。";
    
    case "Email rate limit exceeded":
      return "メール送信回数が上限に達しました。しばらく待ってから再度お試しください。";
    
    default:
      // エラーメッセージに特定のキーワードが含まれている場合
      if (error.message.includes("rate limit")) {
        return "リクエストが多すぎます。しばらく待ってから再度お試しください。";
      }
      
      if (error.message.includes("network") || error.message.includes("fetch")) {
        return "ネットワークエラーが発生しました。インターネット接続を確認して、再度お試しください。";
      }
      
      if (error.message.includes("timeout")) {
        return "タイムアウトエラーが発生しました。再度お試しください。";
      }

      // デフォルトメッセージ
      return "Magic Linkの送信に失敗しました。もう一度お試しください。問題が続く場合は、しばらく時間をおいてから再度お試しください。";
  }
}

/**
 * エラーコードから簡潔なエラータイプを取得
 */
export function getAuthErrorType(error: AuthError | null): "validation" | "rate_limit" | "network" | "server" | "unknown" {
  if (!error) {
    return "unknown";
  }

  const message = error.message.toLowerCase();

  if (message.includes("invalid email") || message.includes("email")) {
    return "validation";
  }

  if (message.includes("rate limit") || message.includes("60 seconds")) {
    return "rate_limit";
  }

  if (message.includes("network") || message.includes("fetch") || message.includes("timeout")) {
    return "network";
  }

  if (message.includes("disabled") || message.includes("not available")) {
    return "server";
  }

  return "unknown";
}
