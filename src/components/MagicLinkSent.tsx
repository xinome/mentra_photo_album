"use client";

import { Mail, ArrowLeft, RefreshCw, ExternalLink, LogIn, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface MagicLinkSentProps {
  email: string;
  onBack: () => void;
  onResend: () => void;
  isResending?: boolean;
  canResend?: boolean;
  resendCountdown?: number;
  onMockLogin?: (isNewUser: boolean) => void;
  error?: string | null;
}

export function MagicLinkSent({ 
  email, 
  onBack, 
  onResend, 
  isResending = false,
  canResend = true, 
  resendCountdown = 0,
  onMockLogin,
  error
}: MagicLinkSentProps) {
  const emailProvider = email.split('@')[1];
  
  const getEmailProviderUrl = (provider: string) => {
    const providers: Record<string, string> = {
      'gmail.com': 'https://mail.google.com',
      'yahoo.co.jp': 'https://mail.yahoo.co.jp',
      'outlook.com': 'https://outlook.live.com',
      'hotmail.com': 'https://outlook.live.com',
      'icloud.com': 'https://www.icloud.com/mail',
    };
    return providers[provider.toLowerCase()];
  };

  const emailUrl = getEmailProviderUrl(emailProvider);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">メールを送信しました</CardTitle>
            <CardDescription className="text-base">
              ログインリンクを以下のメールアドレスに送信しました
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Email Address */}
            <div className="text-center">
              <Badge variant="secondary" className="px-4 py-2 text-base">
                {email}
              </Badge>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">次の手順：</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>メールボックスを確認してください</li>
                  <li>「Mentra Photo Albumにログイン」という件名のメールを探してください</li>
                  <li>メール内のログインボタンをクリックしてください</li>
                </ol>
              </div>

              {/* Quick Email Access */}
              {emailUrl && (
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => window.open(emailUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  {emailProvider}を開く
                </Button>
              )}

              {/* Troubleshooting */}
              <div className="text-sm text-muted-foreground space-y-2">
                <p>メールが見つからない場合：</p>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• 迷惑メールフォルダをご確認ください</li>
                  <li>• メールの到着まで数分かかる場合があります</li>
                  <li>• メールアドレスに間違いがないかご確認ください</li>
                </ul>
              </div>
            </div>

            {/* エラーメッセージ表示 */}
            {error && (
              <div
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 mb-1">再送信エラー</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {/* Resend Button */}
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={onResend}
                disabled={!canResend || isResending}
              >
                {isResending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                    再送信中...
                  </>
                ) : canResend ? (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    メールを再送信
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    再送信まであと {resendCountdown}秒
                  </>
                )}
              </Button>

              {/* Demo Login Buttons - Only for testing */}
              {onMockLogin && (
                <div className="space-y-2">
                  <div className="text-xs text-center text-muted-foreground">
                    デモ用（実際のメールは送信されません）
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onMockLogin(true)}
                      className="gap-1"
                    >
                      <LogIn className="h-3 w-3" />
                      新規ユーザー
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onMockLogin(false)}
                      className="gap-1"
                    >
                      <LogIn className="h-3 w-3" />
                      既存ユーザー
                    </Button>
                  </div>
                </div>
              )}

              {/* Back Button */}
              <Button variant="ghost" className="w-full gap-2" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
                メールアドレスを変更
              </Button>
            </div>

            {/* Security Note */}
            <div className="text-xs text-muted-foreground text-center p-3 bg-gray-50 rounded-lg">
              <p className="mb-1">🔒 セキュリティについて</p>
              <p>
                ログインリンクは10分間有効です。
                リンクは一度のみ使用可能で、使用後は無効になります。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}