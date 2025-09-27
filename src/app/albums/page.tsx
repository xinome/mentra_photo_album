import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-server";

export default async function AlbumsPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <Link href="/(auth)/login">ログイン</Link>;

  const { data: albums } = await supabase
    .from("albums").select("id,title,updated_at")
    .order("updated_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">アルバム</h1>
        <form action={createAlbum}>
          <button className="rounded bg-black text-white px-3 py-2">新規作成</button>
        </form>
      </div>
      <ul className="mt-6 space-y-2">
        {albums?.map(a => (
          <li key={a.id}>
            <Link className="block border rounded p-3 hover:bg-gray-50" href={`/albums/${a.id}`}>{a.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

async function createAlbum() {
  "use server";
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("albums").insert({ title: "新しいアルバム", owner_id: user.id });
}