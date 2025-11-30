// supabase/functions/share/index.ts
// Deno Deploy Runtime / Supabase Functions
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type PhotoRow = {
  id: string;
  storage_key: string;
  caption: string | null;
  created_at: string;
};

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Service Role: RLSを超えて読み取り
    );

    // 共有リンクの検証
    const { data: share, error: shareErr } = await supabase
      .from("shares")
      .select("album_id, permission, expires_at, disabled")
      .eq("token", token)
      .single();

    if (shareErr || !share || share.disabled || (share.expires_at && new Date(share.expires_at) < new Date())) {
      return new Response(JSON.stringify({ error: "Link expired or disabled" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      });
    }

    // アルバム情報
    const { data: album, error: albumErr } = await supabase
      .from("albums")
      .select("id, title, description, cover_photo_id, is_public, category")
      .eq("id", share.album_id)
      .single();

    if (albumErr || !album) {
      return new Response(JSON.stringify({ error: "Album not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    // 写真一覧
    const { data: photos, error: photosErr } = await supabase
      .from("photos")
      .select("id, storage_key, caption, created_at")
      .eq("album_id", share.album_id)
      .order("created_at", { ascending: true });

    if (photosErr) {
      return new Response(JSON.stringify({ error: photosErr.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    // 署名URLをまとめて生成（有効期限は短め、例：60分）
    const keys = (photos ?? []).map((p: PhotoRow) => p.storage_key);
    const signed = keys.length
      ? await supabase.storage.from("photos").createSignedUrls(keys, 60 * 60) // seconds
      : { data: [] };

    const urlMap = new Map<string, string>();
    (signed.data ?? []).forEach((item: { path: string; signedUrl: string }) => {
      urlMap.set(item.path, item.signedUrl);
    });

    const photosWithUrls = (photos ?? []).map((p: PhotoRow) => ({
      id: p.id,
      caption: p.caption,
      created_at: p.created_at,
      storage_key: p.storage_key,
      signed_url: urlMap.get(p.storage_key) ?? null,
    }));

    return new Response(JSON.stringify({ album, photos: photosWithUrls, permission: share.permission }), {
      headers: { "content-type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
});
