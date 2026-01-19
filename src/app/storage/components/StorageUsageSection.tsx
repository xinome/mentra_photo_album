"use client";

import { Database, HardDrive } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StorageUsageSectionProps {
  usedStorage: number; // バイト単位
  totalStorage?: number; // バイト単位（オプション、指定がない場合は表示しない）
  totalFiles?: number; // 総ファイル数
  averageFileSize?: number; // 平均ファイルサイズ（バイト単位）
}

export const StorageUsageSection = ({
  usedStorage,
  totalStorage,
  totalFiles = 0,
  averageFileSize = 0,
}: StorageUsageSectionProps) => {
  // バイトを適切な単位に変換
  const formatBytes = (bytes: number): { value: number; unit: string } => {
    if (bytes === 0) return { value: 0, unit: "B" };
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return {
      value: parseFloat((bytes / Math.pow(k, i)).toFixed(2)),
      unit: sizes[i],
    };
  };

  const used = formatBytes(usedStorage);
  const total = totalStorage ? formatBytes(totalStorage) : null;
  const usagePercentage = totalStorage ? (usedStorage / totalStorage) * 100 : 0;

  return (
    <Card className="border-2 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
            <HardDrive className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">ストレージ使用量</CardTitle>
            <CardDescription className="mt-0.5">
              現在のストレージ使用状況を確認できます
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 使用量表示 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                使用中
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {used.value}
                </span>
                <span className="text-sm text-gray-600">{used.unit}</span>
                {total && (
                  <>
                    <span className="text-gray-400">/</span>
                    <span className="text-lg font-semibold text-gray-700">
                      {total.value} {total.unit}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* プログレスバー */}
            {totalStorage && (
              <div className="space-y-2">
                <Progress
                  value={usagePercentage}
                  className="h-3 bg-gray-200"
                />
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{usagePercentage.toFixed(1)}% 使用中</span>
                  {totalStorage && (
                    <span>
                      {formatBytes(totalStorage - usedStorage).value}{" "}
                      {formatBytes(totalStorage - usedStorage).unit} 残り
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 詳細情報 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50/50 border border-blue-100">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">総ファイル数</p>
                <p className="text-sm font-semibold text-gray-900">
                  {totalFiles.toLocaleString()} 件
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200">
              <HardDrive className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-600">平均ファイルサイズ</p>
                <p className="text-sm font-semibold text-gray-900">
                  {averageFileSize > 0
                    ? `${formatBytes(averageFileSize).value} ${formatBytes(averageFileSize).unit}`
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

