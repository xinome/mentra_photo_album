export default async function SharePage({ params }: { params: { token: string }}) {
  const res = await fetch(`${process.env.SHARE_FUNCTION_URL}?token=${params.token}`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) return <main className="p-6">リンクが無効です。</main>;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-semibold">{data.album?.title}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
        {data.photos?.map((p: any) => (
          <img key={p.id} src={p.signed_url} className="rounded border object-cover aspect-square" />
        ))}
      </div>
    </main>
  );
}