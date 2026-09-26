-- JinZu Software: app asset management (icons + screenshots)
-- Run this in the Supabase SQL editor, or via `supabase db push`.
-- No existing bucket or screenshots table was found in 0001_applications.sql,
-- so both are created fresh here.

-- 1. Storage bucket for app icons and screenshots.
insert into storage.buckets (id, name, public)
values ('app-assets', 'app-assets', true)
on conflict (id) do nothing;

-- Public (including anonymous website visitors) can view files in this bucket.
drop policy if exists "Public can view app assets" on storage.objects;
create policy "Public can view app assets"
  on storage.objects for select
  to public
  using (bucket_id = 'app-assets');

-- Only signed-in admins can upload new files.
drop policy if exists "Authenticated users can upload app assets" on storage.objects;
create policy "Authenticated users can upload app assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'app-assets');

-- Only signed-in admins can replace (upsert) existing files.
drop policy if exists "Authenticated users can update app assets" on storage.objects;
create policy "Authenticated users can update app assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'app-assets')
  with check (bucket_id = 'app-assets');

-- Only signed-in admins can delete files.
drop policy if exists "Authenticated users can delete app assets" on storage.objects;
create policy "Authenticated users can delete app assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'app-assets');

-- 2. Screenshots table: one row per screenshot, related to an application.
-- Kept separate from `applications` rather than an array column, so it can
-- scale to many screenshots per app and support ordering/removal cleanly.
create table if not exists public.app_screenshots (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists app_screenshots_application_id_idx
  on public.app_screenshots (application_id);

alter table public.app_screenshots enable row level security;

-- Public can view screenshots that belong to an active, non-deleted app —
-- mirrors the existing "Public can view active applications" policy.
drop policy if exists "Public can view screenshots of active applications" on public.app_screenshots;
create policy "Public can view screenshots of active applications"
  on public.app_screenshots for select
  to anon
  using (
    exists (
      select 1 from public.applications a
      where a.id = app_screenshots.application_id
        and a.active = true
        and a.deleted_at is null
    )
  );

-- Signed-in admins can view every screenshot, including for inactive/deleted apps.
drop policy if exists "Authenticated users can view all screenshots" on public.app_screenshots;
create policy "Authenticated users can view all screenshots"
  on public.app_screenshots for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert screenshots" on public.app_screenshots;
create policy "Authenticated users can insert screenshots"
  on public.app_screenshots for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update screenshots" on public.app_screenshots;
create policy "Authenticated users can update screenshots"
  on public.app_screenshots for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete screenshots" on public.app_screenshots;
create policy "Authenticated users can delete screenshots"
  on public.app_screenshots for delete
  to authenticated
  using (true);
