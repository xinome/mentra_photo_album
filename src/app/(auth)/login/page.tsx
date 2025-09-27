"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const sendMagicLink = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email, options:{ emailRedirectTo: `${location.origin}/albums` }});
    if (!error) setSent(true);
  };

  return (
    <main className="mx-auto max-w-sm p-6 space-y-4">
      <h1 className="text-xl font-semibold">ログイン</h1>
      <input className="w-full border rounded p-2" placeholder="you@example.com"
             value={email} onChange={(e)=>setEmail(e.target.value)} />
      <button onClick={sendMagicLink} className="w-full rounded bg-black text-white p-2">
        Magic Link 送信
      </button>
      {sent && <p className="text-sm">メールを確認してください。</p>}
    </main>
  );
}