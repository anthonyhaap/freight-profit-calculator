-- 002_cost_profiles.sql
-- Creates the cost_profiles table for per-user (and optionally per-truck)
-- cost structures that the calculator and decision score read from.
-- Safe to re-run.

-- =============================================================================
-- Table
-- =============================================================================

create table if not exists public.cost_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- identity
  name text not null,                          -- e.g. "Default" or "Truck 101 - 2022 Cascadia"
  is_default boolean not null default false,   -- exactly one default per user (enforced via partial unique index)

  -- fixed cost: per-day allocation of truck pmt, trailer pmt, insurance, plates,
  -- permits, ELD, software, admin overhead. Carrier figures monthly fixed / days
  -- operated and enters that here.
  fixed_cost_per_day numeric(10, 2) not null default 0,

  -- variable cost per mile (maintenance + tires + other per-mile items not fuel/driver)
  variable_cost_per_mile numeric(10, 4) not null default 0,

  -- fuel
  mpg numeric(10, 2) not null default 6.5,
  default_fuel_price numeric(10, 4) not null default 3.89,

  -- driver pay (one of 5 methods; only the relevant fields are used per calc)
  driver_pay_method text not null default 'per_mile' check (driver_pay_method in (
    'per_mile', 'percentage', 'hourly', 'salary', 'owner_draw'
  )),
  driver_pay_per_mile numeric(10, 4) not null default 0,            -- used when method = per_mile
  driver_pay_percentage numeric(5, 2) not null default 0,           -- 0-100, used when method = percentage
  driver_pay_hourly numeric(10, 2) not null default 0,              -- used when method = hourly
  driver_pay_salary_per_week numeric(10, 2) not null default 0,     -- used when method = salary
  driver_pay_owner_draw_per_week numeric(10, 2) not null default 0, -- used when method = owner_draw
  standard_week_hours numeric(5, 2) not null default 60,            -- prorates salary/owner_draw to a load by tripHours/this

  -- factoring / quick pay default (per-load can override)
  factoring_fee_pct numeric(5, 2) not null default 0,               -- 0-100

  -- targets
  target_profit_margin_pct numeric(5, 2) not null default 15.00,    -- drives "target rate" recommendation

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cost_profiles_user_id_idx
  on public.cost_profiles (user_id);

-- Enforce: at most one default profile per user
create unique index if not exists cost_profiles_one_default_per_user
  on public.cost_profiles (user_id)
  where is_default = true;

-- =============================================================================
-- updated_at trigger (reuses set_updated_at() defined in 001)
-- =============================================================================

drop trigger if exists cost_profiles_set_updated_at on public.cost_profiles;

create trigger cost_profiles_set_updated_at
before update on public.cost_profiles
for each row execute function public.set_updated_at();

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table public.cost_profiles enable row level security;

drop policy if exists "cost_profiles_select_own" on public.cost_profiles;
create policy "cost_profiles_select_own"
  on public.cost_profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists "cost_profiles_insert_own" on public.cost_profiles;
create policy "cost_profiles_insert_own"
  on public.cost_profiles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "cost_profiles_update_own" on public.cost_profiles;
create policy "cost_profiles_update_own"
  on public.cost_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "cost_profiles_delete_own" on public.cost_profiles;
create policy "cost_profiles_delete_own"
  on public.cost_profiles
  for delete
  using (auth.uid() = user_id);
