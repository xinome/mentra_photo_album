"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DangerZoneSectionProps {
  onDeleteAccount: (confirmText: string) => Promise<void>;
  deleting?: boolean;
}

export const DangerZoneSection = ({
  onDeleteAccount,
  deleting = false,
}: DangerZoneSectionProps) => {
  const [confirmText, setConfirmText] = useState("");
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    if (confirmText === "削除") {
      await onDeleteAccount(confirmText);
      setOpen(false);
      setConfirmText("");
    }
  };

  return (
    <Card className="border-2 border-red-200 shadow-lg bg-gradient-to-br from-red-50/50 to-rose-50/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center shadow-md">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl text-red-700">危険な操作</CardTitle>
            <CardDescription className="mt-0.5">
              アカウントの削除など、取り返しのつかない操作を行います
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-white/80 border-2 border-red-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-700">アカウントの削除</h3>
                </div>
                <p className="text-sm text-gray-600">
                  アカウントを削除すると、すべてのデータが永久に削除されます。
                  <br />
                  この操作は取り消すことができません。
                </p>
              </div>
              <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    アカウントを削除
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      アカウントの削除
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3 pt-2">
                      <p className="text-base font-medium text-gray-900">
                        この操作は取り消すことができません。アカウントを削除すると、以下のデータが永久に削除されます：
                      </p>
                      <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-700 ml-2 bg-red-50/50 p-3 rounded border border-red-100">
                        <li>すべてのアルバムと写真</li>
                        <li>プロフィール情報</li>
                        <li>共有設定</li>
                        <li>その他のすべてのデータ</li>
                      </ul>
                      <p className="text-xs text-gray-600 pt-1">
                        注意: 完全なアカウント削除にはサーバーサイドの処理が必要です。プロフィールデータを削除後、サポートにお問い合わせください。
                      </p>
                      <div className="pt-3 border-t border-gray-200">
                        <Label htmlFor="confirm-delete" className="text-sm font-semibold text-gray-900">
                          確認のため、「<span className="font-mono bg-red-100 px-1.5 py-0.5 rounded text-red-700">削除</span>」と入力してください
                        </Label>
                        <Input
                          id="confirm-delete"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder="削除"
                          className="mt-2 border-2 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmText("")}>
                      キャンセル
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={confirmText !== "削除" || deleting}
                      className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
                    >
                      {deleting ? "削除中..." : "アカウントを削除"}
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

