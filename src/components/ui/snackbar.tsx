"use client";

import { useEffect, useState, useRef } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface SnackbarMessage {
  id?: string;
  type: "success" | "error";
  title: string;
  description?: string;
}

interface SnackbarProps {
  message: SnackbarMessage | null;
  onClose?: () => void;
  duration?: number; // 表示時間（ミリ秒、デフォルト: 3000ms）
}

export const Snackbar = ({ message, onClose, duration = 3000 }: SnackbarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 既存のタイマーをクリア
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (message) {
      // メッセージが設定されたら表示
      setIsVisible(true);

      // 指定時間後に自動的に非表示にする
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        // アニメーション完了後にメッセージをクリア
        closeTimerRef.current = setTimeout(() => {
          onClose?.();
        }, 300);
      }, duration);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
        }
      };
    } else {
      // メッセージがnullになったら非表示
      setIsVisible(false);
    }
  }, [message, onClose, duration]);

  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  if (!message) return null;

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 ease-in-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
      )}
      style={{ maxWidth: "calc(100% - 2rem)" }}
    >
      <div
        className={cn(
          "rounded-xl shadow-lg border-2 p-4 flex items-start gap-3 max-w-md mx-auto",
          message.type === "success"
            ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-900 border-green-200 shadow-green-200/50"
            : "bg-gradient-to-r from-red-50 to-rose-50 text-red-900 border-red-200 shadow-red-200/50"
        )}
      >
        <div className="flex-shrink-0 mt-0.5">
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{message.title}</p>
          {message.description && (
            <p className="text-xs mt-1 opacity-90">{message.description}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className={cn(
            "flex-shrink-0 p-1 rounded-md transition-colors",
            message.type === "success"
              ? "hover:bg-green-100 text-green-700"
              : "hover:bg-red-100 text-red-700"
          )}
          aria-label="閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
