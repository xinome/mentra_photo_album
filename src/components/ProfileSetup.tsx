"use client";

import { useState } from "react";
import { Camera, User, ArrowRight, Upload, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Checkbox } from "./ui/checkbox";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProfileSetupProps {
  email: string;
  onComplete: (profileData: ProfileData) => void;
  onSkip?: () => void;
}

interface ProfileData {
  displayName: string;
  avatar?: string;
  bio?: string;
  agreeToTerms: boolean;
}

export function ProfileSetup({ email, onComplete, onSkip }: ProfileSetupProps) {
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: "",
    avatar: "",
    bio: "",
    agreeToTerms: false,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setProfileData({ ...profileData, avatar: url });
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setProfileData({ ...profileData, avatar: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.displayName || !profileData.agreeToTerms) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onComplete(profileData);
  };

  const isFormValid = profileData.displayName.trim() && profileData.agreeToTerms;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">プロフィールを設定</CardTitle>
            <CardDescription className="text-base">
              Mentra Photo Albumへようこそ！<br />
              簡単なプロフィール情報を設定して始めましょう
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Welcome Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Camera className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-900">アカウント作成完了</h4>
                  <p className="text-sm text-green-700">
                    {email} でログインしました。プロフィールを設定して写真アルバムを始めましょう！
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="space-y-3">
                <Label>プロフィール画像（任意）</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profileData.avatar} alt="Profile" />
                    <AvatarFallback>
                      {profileData.displayName
                        ? profileData.displayName.slice(0, 2).toUpperCase()
                        : <User className="h-8 w-8" />
                      }
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex gap-2">
                    {!profileData.avatar ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        画像を選択
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={removeAvatar}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        削除
                      </Button>
                    )}
                  </div>
                  
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  JPEGまたはPNG形式、最大5MBまで
                </p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">表示名 *</Label>
                <Input
                  id="displayName"
                  placeholder="例: 田中太郎、たなかん、Taro など"
                  value={profileData.displayName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, displayName: e.target.value })
                  }
                  required
                />
                <p className="text-sm text-muted-foreground">
                  アルバム内で他のユーザーに表示される名前です
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">自己紹介（任意）</Label>
                <Textarea
                  id="bio"
                  placeholder="趣味や興味について簡単に教えてください..."
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  最大200文字まで
                </p>
              </div>

              {/* Privacy Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">プライバシーについて</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 個人情報は収集いたしません</li>
                  <li>• 設定した情報はアプリ内でのみ使用されます</li>
                  <li>• いつでもプロフィール情報を変更・削除できます</li>
                  <li>• アルバムに参加した際に表示名が他のユーザーに表示されます</li>
                </ul>
              </div>

              {/* Terms Agreement */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={profileData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setProfileData({ ...profileData, agreeToTerms: checked as boolean })
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="terms" className="cursor-pointer">
                      利用規約とプライバシーポリシーに同意する *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      <a href="#" className="text-blue-600 hover:underline">利用規約</a>
                      および
                      <a href="#" className="text-blue-600 hover:underline">プライバシーポリシー</a>
                      をご確認ください
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {onSkip && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={onSkip}
                    className="order-2 sm:order-1"
                  >
                    後で設定
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={!isFormValid || isSubmitting}
                  className="flex-1 order-1 sm:order-2 gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      設定中...
                    </>
                  ) : (
                    <>
                      完了してアルバムを始める
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Demo Account Note */}
            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                これはデモアプリです。実際のデータは保存されません。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Features Preview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/60 backdrop-blur-sm border-0">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Camera className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="font-medium mb-1">簡単アップロード</h4>
              <p className="text-sm text-muted-foreground">
                ドラッグ&ドロップで写真を一括アップロード
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="font-medium mb-1">みんなで共有</h4>
              <p className="text-sm text-muted-foreground">
                リンクを共有して簡単にアルバムを公開
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <ArrowRight className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="font-medium mb-1">整理と検索</h4>
              <p className="text-sm text-muted-foreground">
                カテゴリ分けや検索で写真を簡単に見つける
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}