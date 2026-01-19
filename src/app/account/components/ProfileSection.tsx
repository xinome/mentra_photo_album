"use client";

import { useState, useRef } from "react";
import { Camera, X, Upload, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileSectionProps {
  email: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  onUpdate: (data: { displayName: string; bio: string; avatarFile?: File; removeAvatar?: boolean }) => Promise<void>;
  saving?: boolean;
}

export const ProfileSection = ({
  email,
  displayName,
  bio,
  avatarUrl,
  onUpdate,
  saving = false,
}: ProfileSectionProps) => {
  const [localDisplayName, setLocalDisplayName] = useState(displayName || "");
  const [localBio, setLocalBio] = useState(bio || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleAvatarRemove = async () => {
    setSelectedAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    // 既存のアバターを削除
    if (avatarUrl) {
      await onUpdate({
        displayName: localDisplayName,
        bio: localBio,
        removeAvatar: true,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onUpdate({
      displayName: localDisplayName,
      bio: localBio,
      avatarFile: selectedAvatarFile || undefined,
    });
  };

  return (
    <Card className="border-2 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">プロフィール情報</CardTitle>
            <CardDescription className="mt-0.5">
              アカウントの基本情報を管理します
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* アバター画像 */}
          <div className="space-y-4">
            <Label>プロフィール画像</Label>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Avatar" />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      {localDisplayName?.[0]?.toUpperCase() || email[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                {avatarPreview && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={handleAvatarRemove}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 border-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  画像を選択
                </Button>
                <p className="text-sm text-muted-foreground">
                  推奨サイズ: 400×400px
                  <br />
                  対応形式: JPEG, PNG, GIF（最大5MB）
                </p>
              </div>
            </div>
          </div>

          {/* メールアドレス */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
              メールアドレス
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200"
            />
            <p className="text-xs text-muted-foreground">
              メールアドレスは変更できません
            </p>
          </div>

          {/* 表示名 */}
          <div className="space-y-2">
            <Label htmlFor="display_name" className="text-sm font-semibold text-gray-700">
              表示名
            </Label>
            <Input
              id="display_name"
              type="text"
              value={localDisplayName}
              onChange={(e) => setLocalDisplayName(e.target.value)}
              placeholder="表示名を入力"
              maxLength={50}
              className="border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* 自己紹介 */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">
              自己紹介
            </Label>
            <Textarea
              id="bio"
              value={localBio}
              onChange={(e) => setLocalBio(e.target.value)}
              placeholder="自己紹介を入力してください（任意）"
              rows={4}
              maxLength={500}
              className="border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            />
            <p className="text-xs text-muted-foreground">
              {localBio.length}/500文字
            </p>
          </div>

          {/* 保存ボタン */}
          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {saving ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

