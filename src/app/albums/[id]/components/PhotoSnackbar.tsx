"use client";

// PhotoSnackbarはSnackbarコンポーネントのラッパーとして維持（後方互換性のため）
import { Snackbar } from "@/components/ui/snackbar";

interface SnackbarMessage {
  id: string;
  type: "success" | "error";
  title: string;
  description?: string;
}

interface PhotoSnackbarProps {
  message: SnackbarMessage | null;
  onClose: () => void;
  duration?: number;
}

export function PhotoSnackbar({ message, onClose, duration = 3000 }: PhotoSnackbarProps) {
  return (
    <Snackbar
      message={message ? {
        type: message.type,
        title: message.title,
        description: message.description,
      } : null}
      onClose={onClose}
      duration={duration}
    />
  );
}

