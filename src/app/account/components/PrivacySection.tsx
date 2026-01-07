"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PrivacySectionProps {
  onPrivacyUpdate?: (settings: {
    profileVisibility: boolean;
    dataSharing: boolean;
  }) => Promise<void>;
  saving?: boolean;
}

export function PrivacySection({
  onPrivacyUpdate,
  saving = false,
}: PrivacySectionProps) {
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  const handleProfileVisibilityChange = async (checked: boolean) => {
    setProfileVisibility(checked);
    if (onPrivacyUpdate) {
      await onPrivacyUpdate({
        profileVisibility: checked,
        dataSharing,
      });
    }
  };

  const handleDataSharingChange = async (checked: boolean) => {
    setDataSharing(checked);
    if (onPrivacyUpdate) {
      await onPrivacyUpdate({
        profileVisibility,
        dataSharing: checked,
      });
    }
  };

  return (
    <Card className="border-2 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">プライバシー設定</CardTitle>
            <CardDescription className="mt-0.5">
              プライバシーとデータ共有の設定を管理します
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* プロフィールの公開設定 */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-green-50/50 border border-gray-200">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-600" />
                <Label htmlFor="profile-visibility" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  プロフィールの公開
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                他のユーザーがあなたのプロフィールを閲覧できるようにします
              </p>
            </div>
            <Switch
              id="profile-visibility"
              checked={profileVisibility}
              onCheckedChange={handleProfileVisibilityChange}
              disabled={saving}
            />
          </div>

          {/* データ共有設定 */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-green-50/50 border border-gray-200">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-gray-600" />
                <Label htmlFor="data-sharing" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  データ共有
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                匿名化された使用データを改善のために共有します
              </p>
            </div>
            <Switch
              id="data-sharing"
              checked={dataSharing}
              onCheckedChange={handleDataSharingChange}
              disabled={saving}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

