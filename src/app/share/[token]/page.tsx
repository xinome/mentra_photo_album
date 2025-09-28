import Image from "next/image";

type Photo = {
  id: string;
  signed_url: string;
  caption: string | null;
  created_at: string;
  storage_key: string;
};

type ShareData = {
  album: {
    title: string;
  };
  photos: Photo[];
};

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const res = await fetch(`${process.env.SHARE_FUNCTION_URL}?token=${token}`, { cache: "no-store" });
  const data: ShareData = await res.json();
  if (!res.ok) return <main className="p-6">リンクが無効です。</main>;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-semibold">{data.album?.title}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
        {data.photos?.map((p) => (
          <Image 
            key={p.id} 
            src={p.signed_url} 
            alt={p.caption || "Photo"} 
            width={300}
            height={300}
            className="rounded border object-cover aspect-square" 
          />
        ))}
      </div>
    </main>
  );
}