"use client";

import { useState } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SecuritySectionProps {
  onChangePassword: (password: string) => Promise<void>;
  saving?: boolean;
}

export function SecuritySection({
  onChangePassword,
  saving = false,
}: SecuritySectionProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const validatePassword = (pwd: string): string | undefined => {
    if (pwd.length < 6) {
      return "パスワードは6文字以上で入力してください";
    }
    if (pwd.length > 128) {
      return "パスワードは128文字以内で入力してください";
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // バリデーション
    const passwordError = validatePassword(password);
    const confirmPasswordError =
      password !== confirmPassword ? "パスワードが一致しません" : undefined;

    if (passwordError || confirmPasswordError) {
      setErrors({
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    setErrors({});
    await onChangePassword(password);
    
    // 成功時はフォームをリセット
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <Card className="border-2 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">セキュリティ設定</CardTitle>
            <CardDescription className="mt-0.5">
              パスワードを変更してアカウントのセキュリティを強化します
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 新しいパスワード */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
              新しいパスワード
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                placeholder="新しいパスワードを入力"
                className={`border-2 ${errors.password ? "border-destructive focus:border-destructive focus:ring-destructive/20" : "focus:border-amber-400 focus:ring-2 focus:ring-amber-200"}`}
                aria-invalid={!!errors.password}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
            <p className="text-xs text-muted-foreground">
              6文字以上128文字以内で入力してください
            </p>
          </div>

          {/* パスワード確認 */}
          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-sm font-semibold text-gray-700">
              パスワード確認
            </Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                placeholder="パスワードを再入力"
                className={`border-2 ${errors.confirmPassword ? "border-destructive focus:border-destructive focus:ring-destructive/20" : "focus:border-amber-400 focus:ring-2 focus:ring-amber-200"}`}
                aria-invalid={!!errors.confirmPassword}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          {/* 変更ボタン */}
          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              disabled={saving || !password || !confirmPassword}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {saving ? "変更中..." : "パスワードを変更"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

