"use client";

// PhotoSnackbarはSnackbarコンポーネントのラッパーとして維持（後方互換性のため）
import { useCallback } from "react";
import { Snackbar } from "@/components/ui/snackbar";

interface SnackbarMessage {
  id: string;
  type: "success" | "error";
  title: string;
  description?: string;
}

interface PhotoSnackbarProps {
  message: SnackbarMessage | null;
  onClose?: () => void;
  duration?: number;
}

export const PhotoSnackbar = ({ message, onClose, duration = 3000 }: PhotoSnackbarProps) => {
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <Snackbar
      message={message ? {
        type: message.type,
        title: message.title,
        description: message.description,
      } : null}
      onClose={handleClose}
      duration={duration}
    />
  );
};

