-- 1. Создай публичный bucket videos в Storage (или включи его ниже через UI).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos','videos',true,104857600,array['video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public=true, file_size_limit=104857600;

-- 2. Таблица видеороликов.
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  category text default 'Развлечения',
  video_url text not null,
  thumbnail_url text,
  channel_name text,
  views bigint not null default 0,
  created_at timestamptz not null default now()
);
alter table public.videos enable row level security;

drop policy if exists "Videos are public" on public.videos;
create policy "Videos are public" on public.videos for select using (true);
drop policy if exists "Authenticated users can publish" on public.videos;
create policy "Authenticated users can publish" on public.videos for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "Owners can update videos" on public.videos;
create policy "Owners can update videos" on public.videos for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "Owners can delete videos" on public.videos;
create policy "Owners can delete videos" on public.videos for delete to authenticated using (auth.uid() = owner_id);

-- 3. Storage: читать могут все, загружать и удалять — только в собственную папку user-id/.
drop policy if exists "Public can view videos" on storage.objects;
create policy "Public can view videos" on storage.objects for select using (bucket_id = 'videos');
drop policy if exists "Users upload own videos" on storage.objects;
create policy "Users upload own videos" on storage.objects for insert to authenticated with check (bucket_id = 'videos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users delete own videos" on storage.objects;
create policy "Users delete own videos" on storage.objects for delete to authenticated using (bucket_id = 'videos' and (storage.foldername(name))[1] = auth.uid()::text);
