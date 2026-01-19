"use client";

import { Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AccountManagementSectionProps {
  userId: string;
  createdAt: string | null;
  lastSignInAt: string | null;
}

export const AccountManagementSection = ({
  userId,
  createdAt,
  lastSignInAt,
}: AccountManagementSectionProps) => {
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  return (
    <Card className="border-2 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
            <Info className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">アカウント情報</CardTitle>
            <CardDescription className="mt-0.5">
              アカウントの基本情報を確認できます
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200">
            <span className="text-sm font-semibold text-gray-700">
              ユーザーID
            </span>
            <span className="text-sm font-mono break-all text-gray-900 bg-white/80 px-3 py-1 rounded border">{userId}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200">
            <span className="text-sm font-semibold text-gray-700">
              アカウント作成日
            </span>
            <span className="text-sm text-gray-900 font-medium">{formatDate(createdAt)}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200">
            <span className="text-sm font-semibold text-gray-700">
              最終ログイン
            </span>
            <span className="text-sm text-gray-900 font-medium">{formatDate(lastSignInAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

