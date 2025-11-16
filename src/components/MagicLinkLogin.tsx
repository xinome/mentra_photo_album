"use client";

import { useState } from "react";
import { Camera, Mail, ArrowRight, Shield, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface MagicLinkLoginProps {
  onSendMagicLink: (email: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function MagicLinkLogin({ onSendMagicLink, isLoading = false, error }: MagicLinkLoginProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onSendMagicLink(email);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Hero Section */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Camera className="h-12 w-12 text-blue-600" />
                <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-3xl font-medium text-gray-900">Mentra Photo Album</h1>
                <p className="text-blue-600">みんなの思い出を共有しよう</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-4xl font-medium text-gray-900 leading-tight">
                写真で繋がる、<br />
                <span className="text-blue-600">みんなのアルバム</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-md">
                結婚式、イベント、部活動など、あらゆる場面の写真を簡単にアルバム化して共有できます。
              </p>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1587955793432-7c4ff80918ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90byUyMGFsYnVtJTIwbWVtb3JpZXMlMjBmYW1pbHl8ZW58MXx8fHwxNzU5NjQyOTkzfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Photo memories"
              className="w-full aspect-[4/3] object-cover rounded-2xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Camera className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">簡単アップロード</h3>
              <p className="text-sm text-gray-600">
                ドラッグ&ドロップで写真を一括アップロード
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">安全な共有</h3>
              <p className="text-sm text-gray-600">
                リンク一つで簡単かつ安全に共有
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">ログイン</CardTitle>
              <CardDescription className="text-base">
                メールアドレスを入力するだけで<br />
                安全にログインできます
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Magic Link Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-blue-900">Magic Link認証</h4>
                    <p className="text-sm text-blue-700">
                      パスワード不要で安全にログイン。入力したメールアドレスに送信されるリンクをクリックするだけです。
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className={`pl-10 h-12 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // エラーが表示されている場合、入力時にクリア
                        if (error) {
                          // エラー状態をクリアするために親コンポーネントに通知が必要な場合は、
                          // ここではローカルでクリアするだけ
                        }
                      }}
                      required
                      disabled={isLoading}
                      aria-invalid={error ? "true" : "false"}
                      aria-describedby={error ? "email-error" : undefined}
                    />
                  </div>
                </div>

                {/* エラーメッセージ表示 */}
                {error && (
                  <div
                    id="email-error"
                    className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
                    role="alert"
                  >
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900 mb-1">エラーが発生しました</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full h-12 gap-2" 
                  disabled={!email || isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      送信中...
                    </>
                  ) : (
                    <>
                      Magic Linkを送信
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-xs text-muted-foreground text-center">
                ログインすることで、
                <a href="#" className="text-blue-600 hover:underline">利用規約</a>
                および
                <a href="#" className="text-blue-600 hover:underline">プライバシーポリシー</a>
                に同意したものとみなされます。
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              初回ログインの場合、自動的にアカウントが作成されます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}