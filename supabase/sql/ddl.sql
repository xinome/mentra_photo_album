-- 必要拡張（UUIDと乱数生成）
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  cover_photo_id uuid,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.album_members (
  album_id uuid not null references public.albums(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','editor','viewer')),
  invited_at timestamptz default now(),
  joined_at timestamptz,
  primary key (album_id, user_id)
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references auth.users(id) on delete cascade,
  album_id uuid not null references public.albums(id) on delete cascade,
  storage_key text not null,
  mime_type text,
  width int,
  height int,
  bytes int,
  exif jsonb,
  caption text,
  created_at timestamptz default now()
);

create table if not exists public.photo_tags (
  photo_id uuid not null references public.photos(id) on delete cascade,
  tag text not null,
  primary key (photo_id, tag)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photos(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  token text not null unique,
  permission text not null check (permission in ('viewer','editor')),
  expires_at timestamptz,
  disabled boolean default false,
  created_at timestamptz default now()
);

-- よく使うインデックス
create index if not exists idx_photos_album on public.photos(album_id);
create index if not exists idx_photos_created on public.photos(created_at desc);
create index if not exists idx_album_members_user on public.album_members(user_id);