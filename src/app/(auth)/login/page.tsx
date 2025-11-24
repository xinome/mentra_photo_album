"use client";
import { supabase } from "@/lib/supabase";
import { getAuthRedirectUrl } from "@/lib/config";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import React, { useState } from "react";
import { MagicLinkLogin } from "@/components/MagicLinkLogin";
import { MagicLinkSent } from "@/components/MagicLinkSent";

// 動的レンダリングを強制（プリレンダリングを無効化）
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleSendMagicLink = async (email: string) => {
    setLoading(true);
    setError(null);
    setEmail(email);
    
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({ 
      email, 
      options: { 
        emailRedirectTo: getAuthRedirectUrl()
      }
    });
    
      if (authError) {
        console.error("Magic Link送信エラー:", authError);
        setError(getAuthErrorMessage(authError));
        setLoading(false);
        return;
      }
      
      // 成功時
      setSent(true);
      setError(null);
    } catch (err) {
      console.error("予期しないエラー:", err);
      setError("予期しないエラーが発生しました。もう一度お試しください。");
    } finally {
    setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setResendError(null);
    
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({ 
      email, 
      options: { 
        emailRedirectTo: getAuthRedirectUrl()
      }
    });
      
      if (authError) {
        console.error("Magic Link再送信エラー:", authError);
        setResendError(getAuthErrorMessage(authError));
      }
    } catch (err) {
      console.error("予期しないエラー:", err);
      setResendError("予期しないエラーが発生しました。もう一度お試しください。");
    } finally {
    setLoading(false);
    }
  };

  const handleBack = () => {
    setSent(false);
    setEmail("");
    setError(null);
    setResendError(null);
  };

  if (sent) {
    return (
      <MagicLinkSent
        email={email}
        onBack={handleBack}
        onResend={handleResend}
        isResending={loading}
        error={resendError}
      />
    );
  }

  return (
    <MagicLinkLogin
      onSendMagicLink={handleSendMagicLink}
      isLoading={loading}
      error={error}
    />
  );
}