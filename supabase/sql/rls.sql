-- RLS有効化
alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.album_members enable row level security;
alter table public.comments enable row level security;
alter table public.shares enable row level security;

-- albums: 参照
create policy albums_select on public.albums
for select
using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.album_members m
    where m.album_id = albums.id and m.user_id = auth.uid()
  )
  or is_public = true
);

-- albums: 作成（オーナー＝自分）
create policy albums_insert on public.albums
for insert
with check ( owner_id = auth.uid() );

-- albums: 更新（オーナー or エディタ）
create policy albums_update on public.albums
for update
using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.album_members m
    where m.album_id = albums.id
      and m.user_id = auth.uid()
      and m.role in ('owner','editor')
  )
);

-- album_members: 参照（当事者のみ）
create policy album_members_select on public.album_members
for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.albums a
    where a.id = album_members.album_id and a.owner_id = auth.uid()
  )
);

-- photos: 参照（アルバム権限を継承 or 公開アルバム）
create policy photos_select on public.photos
for select
using (
  exists (
    select 1
    from public.albums a
    left join public.album_members m
      on m.album_id = a.id and m.user_id = auth.uid()
    where a.id = photos.album_id
      and (a.owner_id = auth.uid() or m.user_id is not null or a.is_public = true)
  )
);

-- photos: 追加（オーナー or エディタ）
create policy photos_insert on public.photos
for insert
with check (
  exists (
    select 1
    from public.albums a
    left join public.album_members m
      on m.album_id = a.id and m.user_id = auth.uid()
    where a.id = photos.album_id
      and (a.owner_id = auth.uid() or (m.user_id is not null and m.role in ('owner','editor')))
  )
);

-- comments: 参照・投稿（アルバム参照権限者のみ）
create policy comments_select on public.comments
for select
using (
  exists (
    select 1
    from public.photos p
    join public.albums a on a.id = p.album_id
    left join public.album_members m on m.album_id = a.id and m.user_id = auth.uid()
    where p.id = comments.photo_id
      and (a.owner_id = auth.uid() or m.user_id is not null or a.is_public = true)
  )
);

create policy comments_insert on public.comments
for insert
with check ( author_id = auth.uid() );

-- shares: オーナーのみ操作可能（Edge FunctionはService Roleで実行）
create policy shares_select on public.shares
for select
using (
  exists (
    select 1 from public.albums a
    where a.id = shares.album_id and a.owner_id = auth.uid()
  )
);

create policy shares_insert on public.shares
for insert
with check (
  exists (
    select 1 from public.albums a
    where a.id = shares.album_id and a.owner_id = auth.uid()
  )
);

create policy shares_update on public.shares
for update
using (
  exists (
    select 1 from public.albums a
    where a.id = shares.album_id and a.owner_id = auth.uid()
  )
);