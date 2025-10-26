"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { MagicLinkLogin } from "@/components/MagicLinkLogin";
import { MagicLinkSent } from "@/components/MagicLinkSent";

// 動的レンダリングを強制（プリレンダリングを無効化）
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendMagicLink = async (email: string) => {
    setLoading(true);
    setEmail(email);
    
    const { error } = await supabase.auth.signInWithOtp({ 
      email, 
      options: { 
        emailRedirectTo: `${location.origin}/albums` 
      }
    });
    
    if (!error) {
      setSent(true);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true);
    await supabase.auth.signInWithOtp({ 
      email, 
      options: { 
        emailRedirectTo: `${location.origin}/albums` 
      }
    });
    setLoading(false);
  };

  const handleBack = () => {
    setSent(false);
    setEmail("");
  };

  if (sent) {
    return (
      <MagicLinkSent
        email={email}
        onBack={handleBack}
        onResend={handleResend}
      />
    );
  }

  return (
    <MagicLinkLogin
      onSendMagicLink={handleSendMagicLink}
      isLoading={loading}
    />
  );
}