-- JinZu Software: applications table
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tagline text not null default '',
  short_description text not null default '',
  description text not null default '',
  category text not null default '',
  status text not null default 'coming-soon'
    check (status in ('available', 'in-development', 'coming-soon', 'maintenance', 'discontinued')),
  version text,
  download_url text,
  website_url text,
  release_date date,
  featured boolean not null default false,
  display_order integer not null default 0,
  active boolean not null default true,
  icon_url text,
  features text[] not null default '{}',
  who_for text[] not null default '{}',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_slug_idx on public.applications (slug);
create index if not exists applications_status_idx on public.applications (status);
create index if not exists applications_active_idx on public.applications (active);

-- keep updated_at fresh on every row change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.applications enable row level security;

-- Public (anon) visitors can only read active, non-deleted apps.
drop policy if exists "Public can view active applications" on public.applications;
create policy "Public can view active applications"
  on public.applications for select
  to anon
  using (active = true and deleted_at is null);

-- Signed-in admins can read everything (including inactive/deleted, for the admin panel).
drop policy if exists "Authenticated users can view all applications" on public.applications;
create policy "Authenticated users can view all applications"
  on public.applications for select
  to authenticated
  using (true);

-- Signed-in admins can create, update, and delete applications.
drop policy if exists "Authenticated users can insert applications" on public.applications;
create policy "Authenticated users can insert applications"
  on public.applications for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update applications" on public.applications;
create policy "Authenticated users can update applications"
  on public.applications for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete applications" on public.applications;
create policy "Authenticated users can delete applications"
  on public.applications for delete
  to authenticated
  using (true);

-- Seed the four current JinZu applications.
-- Download URLs are intentionally left NULL until real links exist.
insert into public.applications
  (name, slug, tagline, category, status, short_description, description, who_for, features, display_order, active)
values
  (
    'Utang Tracker',
    'utang-tracker',
    'Personal Lending & Expense Manager',
    'Finance',
    'available',
    'Keep track of money you''ve lent, payments received, outstanding balances, expenses, and borrower information in one simple app.',
    'Utang Tracker helps individuals and families manage personal lending without the mental math. Record who owes what, log payments as they come in, and see your outstanding receivables at a glance.',
    array['Individuals who lend money to friends or family', 'Freelancers tracking client payables and receivables', 'Small informal lenders who need a simple system'],
    array['Borrower profiles with contact and lending history', 'Track loans, partial payments, and outstanding balances', 'Simple expense logging alongside lending records', 'Overview of who owes you and who you owe'],
    1,
    true
  ),
  (
    'JinZu Inventory Management System',
    'inventory-manager',
    'Inventory & Business Management for Small Businesses',
    'Business',
    'in-development',
    'Manage inventory, sales, purchasing, and payments in one place, built for the pace of small business operations.',
    'JIMS is being designed to give small businesses a practical way to manage stock, sales, and purchasing without complex enterprise software.',
    array['Small retail and trading businesses', 'Owners managing inventory across one or more locations', 'Teams that need simple sales and purchasing records'],
    array['Inventory tracking', 'Sales and purchasing records', 'Payment management', 'QR / barcode support', 'Reports', 'Offline backup'],
    2,
    true
  ),
  (
    'Expense Manager',
    'expense-manager',
    'Personal Expense & Financial Management',
    'Finance',
    'coming-soon',
    'A simple personal expense and financial management application for everyday budgeting.',
    'Expense Manager is a planned application focused on helping individuals track day-to-day spending and get a clearer picture of their personal finances.',
    array['Individuals', 'Students', 'Freelancers managing personal budgets'],
    array['Expense logging', 'Spending overview', 'Simple budgeting tools'],
    3,
    true
  ),
  (
    'STEM Explorer',
    'stem-explorer',
    'Interactive Learning for STEM Concepts',
    'Education',
    'coming-soon',
    'An educational application designed to help students explore STEM concepts in an interactive, understandable way.',
    'STEM Explorer is a planned educational application aimed at making science, technology, engineering, and math concepts more approachable for students.',
    array['Students', 'Educators looking for supplementary tools'],
    array['Interactive concept exploration', 'Designed for student-friendly learning'],
    4,
    true
  )
on conflict (slug) do nothing;
