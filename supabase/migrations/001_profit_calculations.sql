-- 001_profit_calculations.sql
-- Creates the profit_calculations table, RLS policies, and updated_at trigger.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.

-- =============================================================================
-- Table
-- =============================================================================

create table if not exists public.profit_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- input fields
  load_name text not null,
  revenue numeric(12, 2) not null,
  loaded_miles numeric(10, 2) not null,
  deadhead_miles numeric(10, 2) not null,
  trip_hours numeric(10, 2) not null,
  fuel_price numeric(10, 4) not null,
  mpg numeric(10, 2) not null,
  driver_pay_per_mile numeric(10, 4) not null,
  hourly_operating_cost numeric(10, 2) not null,
  maintenance_per_mile numeric(10, 4) not null,

  -- computed output fields (stored so loads view doesn't have to recompute)
  total_miles numeric(10, 2) not null,
  fuel_cost numeric(12, 2) not null,
  driver_pay numeric(12, 2) not null,
  maintenance_cost numeric(12, 2) not null,
  hourly_cost_total numeric(12, 2) not null,
  total_trip_cost numeric(12, 2) not null,
  net_profit numeric(12, 2) not null,
  profit_per_loaded_mile numeric(12, 2) not null,
  profit_per_hour numeric(12, 2) not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profit_calculations_user_id_created_at_idx
  on public.profit_calculations (user_id, created_at desc);

-- If the table was created by an earlier init.sql that didn't have updated_at,
-- add it now so the trigger below has a column to write to.
alter table public.profit_calculations
  add column if not exists updated_at timestamptz not null default now();

-- =============================================================================
-- updated_at trigger
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profit_calculations_set_updated_at on public.profit_calculations;

create trigger profit_calculations_set_updated_at
before update on public.profit_calculations
for each row execute function public.set_updated_at();

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table public.profit_calculations enable row level security;

-- users can read their own rows
drop policy if exists "profit_calculations_select_own" on public.profit_calculations;
create policy "profit_calculations_select_own"
  on public.profit_calculations
  for select
  using (auth.uid() = user_id);

-- users can insert rows only for themselves
drop policy if exists "profit_calculations_insert_own" on public.profit_calculations;
create policy "profit_calculations_insert_own"
  on public.profit_calculations
  for insert
  with check (auth.uid() = user_id);

-- users can update their own rows
drop policy if exists "profit_calculations_update_own" on public.profit_calculations;
create policy "profit_calculations_update_own"
  on public.profit_calculations
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- users can delete their own rows
drop policy if exists "profit_calculations_delete_own" on public.profit_calculations;
create policy "profit_calculations_delete_own"
  on public.profit_calculations
  for delete
  using (auth.uid() = user_id);
