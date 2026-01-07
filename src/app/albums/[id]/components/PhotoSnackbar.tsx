"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface SnackbarMessage {
  id: string;
  type: "success" | "error";
  title: string;
  description?: string;
}

interface PhotoSnackbarProps {
  message: SnackbarMessage | null;
  onClose: () => void;
}

export function PhotoSnackbar({ message, onClose }: PhotoSnackbarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // アニメーション完了後にメッセージをクリア
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={cn(
        "relative z-50 transition-all duration-300 ease-in-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      )}
    >
      <div
        className={cn(
          "rounded-xl shadow-lg border-2 p-4 flex items-start gap-3 max-w-md",
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
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className={cn(
            "flex-shrink-0 p-1 rounded-md transition-colors",
            message.type === "success"
              ? "hover:bg-green-100 text-green-700"
              : "hover:bg-red-100 text-red-700"
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

