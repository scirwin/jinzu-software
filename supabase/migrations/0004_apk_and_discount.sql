-- JinZu Software: discounted pricing + secure APK storage (Phase 2)
--
-- This migration is additive and backward-compatible:
--   - All new `applications` columns are nullable or have safe defaults
--     that preserve current behavior (no app gains a discount or a
--     downloadable APK just from this migration running).
--   - No existing table, column, policy, or row is altered.
--   - The new `app-downloads` bucket is PRIVATE (unlike `app-assets`),
--     and no `anon` or `authenticated` storage policy is created for it.
--     Only the service-role key (which bypasses RLS) can read or write
--     APK objects. All public/admin access to APKs must go through
--     server-side code (signed upload/download URLs), never direct
--     client access to the bucket.
--
-- Run this in the Supabase SQL editor (or via `supabase db push`).

-- ---------------------------------------------------------------------
-- 1. Extend public.applications with discount + APK metadata fields
-- ---------------------------------------------------------------------

alter table public.applications
  add column if not exists discounted_price numeric(10,2),
  add column if not exists download_enabled boolean not null default false,
  add column if not exists apk_storage_path text,
  add column if not exists apk_filename text,
  add column if not exists apk_size_bytes bigint,
  add column if not exists apk_uploaded_at timestamptz;

-- Guard rails, mirroring the existing `applications_price_nonnegative` /
-- `applications_currency_not_blank` style from 0003.
alter table public.applications
  drop constraint if exists applications_discounted_price_nonnegative;
alter table public.applications
  add constraint applications_discounted_price_nonnegative
  check (discounted_price is null or discounted_price >= 0);

-- A discount only makes sense when there is a regular price to discount
-- from, and it must actually be a discount (strictly less than price).
alter table public.applications
  drop constraint if exists applications_discounted_price_below_price;
alter table public.applications
  add constraint applications_discounted_price_below_price
  check (
    discounted_price is null
    or (price is not null and discounted_price < price)
  );

-- No data backfill needed: every existing row (including LendZu) already
-- gets discounted_price = null and download_enabled = false via the
-- column defaults above, so nothing becomes discounted or downloadable
-- as a side effect of this migration.

-- ---------------------------------------------------------------------
-- 2. Private storage bucket for APKs
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('app-downloads', 'app-downloads', false)
on conflict (id) do nothing;

-- Deliberately NO policies for `anon` or `authenticated` are created for
-- this bucket. `storage.objects` already has Row Level Security enabled
-- (Supabase enables it by default), and RLS policies are permissive:
-- access is granted if ANY policy matches, so the *absence* of a
-- matching policy for a given role/bucket combination is what denies
-- access — an explicit "deny" policy would be redundant at best and, if
-- written as `using (bucket_id != 'app-downloads')`, would actually be a
-- dangerous mistake: it would grant that role full access to every
-- OTHER bucket (including any created later), because permissive
-- policies OR together rather than narrowing each other down.
--
-- So: no policy here means neither `anon` nor `authenticated` can read,
-- insert, update, or delete objects in `app-downloads` through the
-- client libraries. Only the service-role key (used exclusively in
-- server-only code, e.g. lib/actions/apk.ts and the /api/download
-- route) can touch this bucket, and only via signed URLs it generates
-- itself with a short expiry.

-- Storage object path convention (enforced in application code, not the
-- DB): applications/{application_id}/apk/{timestamp}-{filename}
