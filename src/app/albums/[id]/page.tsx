import { createSupabaseServer } from "@/lib/supabase-server";

export default async function AlbumDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseServer();
  const { data: album } = await supabase.from("albums").select("*").eq("id", id).single();
  const { data: photos } = await supabase.from("photos").select("id,storage_key,caption").eq("album_id", id).order("created_at");

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">{album?.title}</h1>
      {/* アップロード */}
      <form action={uploadImage.bind(null, id)}>
        <input type="file" accept="image/*" name="file" />
        <button className="ml-2 rounded bg-black text-white px-3 py-1">追加</button>
      </form>

      {/* 共有リンク */}
      <form action={createShare.bind(null, id)}>
        <button className="rounded border px-3 py-1">共有リンク発行</button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos?.map((p) => (
          <Photo key={p.id} storageKey={p.storage_key} />
        ))}
      </div>
    </main>
  );
}

async function uploadImage(albumId: string, formData: FormData) {
  "use server";
  const supabase = createSupabaseServer();
  const file = formData.get("file") as File | null;
  if (!file) return;

  const key = `albums/${albumId}/photos/${crypto.randomUUID()}-${file.name}`;
  const { error: upErr } = await supabase.storage.from("photos").upload(key, file, { upsert: false });
  if (!upErr) {
    await supabase.from("photos").insert({ album_id: albumId, storage_key: key, mime_type: file.type, bytes: file.size });
  }
}

async function createShare(albumId: string) {
  "use server";
  const supabase = createSupabaseServer();
  const token = crypto.randomUUID().replace(/-/g, "");
  await supabase.from("shares").insert({ album_id: albumId, token, permission: "viewer" });
}

async function getSignedUrl(path: string) {
  const supabase = createSupabaseServer();
  const { data } = await supabase.storage.from("photos").createSignedUrl(path, 60 * 10);
  return data?.signedUrl ?? "";
}

async function Photo({ storageKey }: { storageKey: string }) {
  const url = await getSignedUrl(storageKey);
  return (
    <div className="relative aspect-square overflow-hidden rounded border">
      {/* Next/Imageは外部ドメイン許可が必要。とりあえずimgでOK */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="h-full w-full object-cover" />
    </div>
  );
}