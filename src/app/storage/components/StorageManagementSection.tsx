"use client";

import { useState } from "react";
import { Trash2, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StorageManagementSectionProps {
  selectedFilesCount?: number;
  onDeleteSelected?: () => Promise<void>;
  onCleanup?: () => Promise<void>;
  deleting?: boolean;
  cleaning?: boolean;
}

export const StorageManagementSection = ({
  selectedFilesCount = 0,
  onDeleteSelected,
  onCleanup,
  deleting = false,
  cleaning = false,
}: StorageManagementSectionProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (onDeleteSelected) {
      await onDeleteSelected();
      setDeleteDialogOpen(false);
    }
  };

  const handleCleanup = async () => {
    if (onCleanup) {
      await onCleanup();
      setCleanupDialogOpen(false);
    }
  };

  return (
    <Card className="border-2 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
            <Trash2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">ストレージ管理</CardTitle>
            <CardDescription className="mt-0.5">
              ファイルの削除やストレージのクリーンアップを行います
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* ストレージクリーンアップ */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-700">ストレージクリーンアップ</h3>
                </div>
                <p className="text-sm text-gray-600">
                  未使用のファイルや一時ファイルを削除してストレージを最適化します
                </p>
              </div>
              <AlertDialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={cleaning}
                    className="border-2 hover:bg-blue-50"
                  >
                    {cleaning ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        クリーンアップ中...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        クリーンアップ
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>ストレージクリーンアップ</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2 pt-2">
                      <p>
                        未使用のファイルや一時ファイルをスキャンして削除します。
                      </p>
                      <p className="text-sm text-gray-600">
                        この操作は取り消すことができません。
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCleanup}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      クリーンアップ実行
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

