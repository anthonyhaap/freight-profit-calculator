-- 003_redesign_profit_calculations.sql
-- Reshape profit_calculations to support: cost-profile-driven costs (snapshotted),
-- itemized accessorials, lane data (origin/destination), tolls, factoring fee.
--
-- Applied to DB via Supabase MCP on 2026-05-05. Committed to repo for the record.

-- Add new columns
alter table public.profit_calculations
  add column if not exists cost_profile_id uuid references public.cost_profiles(id) on delete set null,
  add column if not exists origin text,
  add column if not exists destination text,
  add column if not exists linehaul_rate numeric(12, 2) not null default 0,
  add column if not exists fuel_surcharge numeric(12, 2) not null default 0,
  add column if not exists accessorial_detention numeric(12, 2) not null default 0,
  add column if not exists accessorial_layover numeric(12, 2) not null default 0,
  add column if not exists accessorial_tonu numeric(12, 2) not null default 0,
  add column if not exists accessorial_stop_pay numeric(12, 2) not null default 0,
  add column if not exists accessorial_tarp numeric(12, 2) not null default 0,
  add column if not exists accessorial_lumper numeric(12, 2) not null default 0,
  add column if not exists accessorial_total numeric(12, 2) not null default 0,
  add column if not exists tolls numeric(12, 2) not null default 0,
  add column if not exists factoring_fee_pct numeric(5, 2) not null default 0,
  add column if not exists factoring_fee_amount numeric(12, 2) not null default 0,
  add column if not exists snapshot_fixed_cost_per_day numeric(10, 2) not null default 0,
  add column if not exists snapshot_variable_cost_per_mile numeric(10, 4) not null default 0,
  add column if not exists snapshot_mpg numeric(10, 2) not null default 6.5,
  add column if not exists snapshot_fuel_price numeric(10, 4) not null default 0,
  add column if not exists snapshot_driver_pay_method text not null default 'per_mile',
  add column if not exists snapshot_driver_pay_per_mile numeric(10, 4) not null default 0,
  add column if not exists snapshot_driver_pay_percentage numeric(5, 2) not null default 0,
  add column if not exists snapshot_driver_pay_hourly numeric(10, 2) not null default 0,
  add column if not exists snapshot_driver_pay_salary_per_week numeric(10, 2) not null default 0,
  add column if not exists snapshot_driver_pay_owner_draw_per_week numeric(10, 2) not null default 0,
  add column if not exists snapshot_standard_week_hours numeric(5, 2) not null default 60,
  add column if not exists fixed_cost_total numeric(12, 2) not null default 0,
  add column if not exists variable_cost_total numeric(12, 2) not null default 0,
  add column if not exists total_revenue numeric(12, 2) not null default 0,
  add column if not exists profit_per_total_mile numeric(12, 2) not null default 0;

alter table public.profit_calculations
  drop column if exists fuel_price,
  drop column if exists mpg,
  drop column if exists driver_pay_per_mile,
  drop column if exists hourly_operating_cost,
  drop column if exists maintenance_per_mile,
  drop column if exists fuel_cost,
  drop column if exists driver_pay,
  drop column if exists maintenance_cost,
  drop column if exists hourly_cost_total,
  drop column if exists revenue;

alter table public.profit_calculations
  add column if not exists fuel_cost numeric(12, 2) not null default 0,
  add column if not exists driver_pay numeric(12, 2) not null default 0;

create index if not exists profit_calculations_cost_profile_id_idx
  on public.profit_calculations (cost_profile_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profit_calculations_snapshot_driver_pay_method_check'
  ) then
    alter table public.profit_calculations
      add constraint profit_calculations_snapshot_driver_pay_method_check
      check (snapshot_driver_pay_method in ('per_mile', 'percentage', 'hourly', 'salary', 'owner_draw'));
  end if;
end$$;
