-- JinZu Software: storefront database foundation (Phase 1)
-- Adds purchase/store-related columns to `applications`, plus new
-- `orders` and `download_grants` tables.
--
-- This migration is additive and backward-compatible:
--   - All new `applications` columns are nullable or have safe defaults
--     that preserve current behavior (no app becomes purchasable/gated).
--   - No existing table, column, policy, or row is altered.
--   - No payment provider integration, download API, or UI change is
--     included here — this is schema only.
--
-- Run this in the Supabase SQL editor (or via `supabase db push`).

-- ---------------------------------------------------------------------
-- 1. Extend public.applications with storefront fields
-- ---------------------------------------------------------------------

alter table public.applications
  add column if not exists price numeric(10,2),
  add column if not exists currency text not null default 'PHP',
  add column if not exists purchasable boolean not null default false,
  add column if not exists online_payment_enabled boolean not null default false,
  add column if not exists direct_payment_enabled boolean not null default false,
  add column if not exists download_gated boolean not null default false,
  add column if not exists platform text;

-- Guard rails: price, when set, must be non-negative; currency must not be blank.
-- (No CHECK on purchasable/payment flags — they're plain booleans with safe defaults.)
alter table public.applications
  drop constraint if exists applications_price_nonnegative;
alter table public.applications
  add constraint applications_price_nonnegative
  check (price is null or price >= 0);

alter table public.applications
  drop constraint if exists applications_currency_not_blank;
alter table public.applications
  add constraint applications_currency_not_blank
  check (length(trim(currency)) > 0);

-- No data backfill needed: every existing row (including LendZu) already
-- gets purchasable/online_payment_enabled/direct_payment_enabled/download_gated
-- = false and currency = 'PHP' via the column defaults above.

-- ---------------------------------------------------------------------
-- 2. public.orders
-- ---------------------------------------------------------------------

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  price numeric(10,2) not null,
  currency text not null,
  payment_method text not null
    check (payment_method in ('online', 'direct')),
  payment_provider text,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'awaiting_confirmation', 'paid', 'failed', 'refunded')),
  order_status text not null default 'pending'
    check (order_status in ('pending', 'confirmed', 'fulfilled', 'cancelled')),
  download_authorized boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  constraint orders_price_nonnegative check (price >= 0),
  constraint orders_currency_not_blank check (length(trim(currency)) > 0),
  constraint orders_customer_email_not_blank check (length(trim(customer_email)) > 0)
);

create index if not exists orders_application_id_idx on public.orders (application_id);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_order_status_idx on public.orders (order_status);
create index if not exists orders_customer_email_idx on public.orders (customer_email);
create index if not exists orders_created_at_idx on public.orders (created_at);

-- Reuse the existing generic updated_at trigger function from 0001_applications.sql.
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

-- No anon access at all: not SELECT, not INSERT, not UPDATE, not DELETE.
-- (Simply not creating any policy for `anon` achieves this under RLS —
-- explicit deny-all policies are added anyway for clarity/auditability.)
drop policy if exists "Anon cannot access orders" on public.orders;
create policy "Anon cannot access orders"
  on public.orders for all
  to anon
  using (false)
  with check (false);

-- Admins (signed-in, matching the existing admin architecture) can fully
-- manage orders, mirroring the existing "Authenticated users can ... applications" policies.
drop policy if exists "Authenticated users can view all orders" on public.orders;
create policy "Authenticated users can view all orders"
  on public.orders for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert orders" on public.orders;
create policy "Authenticated users can insert orders"
  on public.orders for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update orders" on public.orders;
create policy "Authenticated users can update orders"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete orders" on public.orders;
create policy "Authenticated users can delete orders"
  on public.orders for delete
  to authenticated
  using (true);

-- NOTE: customer-facing order creation (from the future storefront, where the
-- visitor is anonymous) is intentionally NOT granted here. Per this phase's
-- security requirements, `anon` gets no INSERT policy on `orders`. A future
-- phase will write customer order requests via a server action using the
-- service role (or a security-definer RPC), never via a direct anon insert.

-- ---------------------------------------------------------------------
-- 3. public.download_grants
-- ---------------------------------------------------------------------

create table if not exists public.download_grants (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id),
  token text not null unique,
  expires_at timestamptz not null,
  max_downloads integer,
  download_count integer not null default 0,
  revoked boolean not null default false,
  created_at timestamptz not null default now(),
  constraint download_grants_max_downloads_positive check (max_downloads is null or max_downloads > 0),
  constraint download_grants_download_count_nonnegative check (download_count >= 0)
);

create index if not exists download_grants_order_id_idx on public.download_grants (order_id);
create index if not exists download_grants_token_idx on public.download_grants (token);
create index if not exists download_grants_expires_at_idx on public.download_grants (expires_at);

alter table public.download_grants enable row level security;

-- No client access at all — neither anon nor authenticated. This table is
-- read/written exclusively by future server-side code (service role or a
-- security-definer function), which bypasses RLS. Explicit deny-all
-- policies are added for both roles for clarity/auditability.
drop policy if exists "Anon cannot access download grants" on public.download_grants;
create policy "Anon cannot access download grants"
  on public.download_grants for all
  to anon
  using (false)
  with check (false);

drop policy if exists "Authenticated cannot access download grants" on public.download_grants;
create policy "Authenticated cannot access download grants"
  on public.download_grants for all
  to authenticated
  using (false)
  with check (false);

-- Token generation guidance (enforced in application code, not the DB):
-- tokens must be generated with a cryptographically secure random source
-- (e.g. crypto.randomUUID() plus additional entropy, or a dedicated
-- token library) — never sequential IDs or predictable values. This
-- migration only defines the column and its uniqueness constraint.
