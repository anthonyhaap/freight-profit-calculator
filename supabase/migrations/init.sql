create table if not exists profit_calculations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  load_name text not null,

  -- inputs
  revenue numeric not null,
  loaded_miles numeric not null,
  deadhead_miles numeric not null,
  trip_hours numeric not null,
  fuel_price numeric not null,
  mpg numeric not null,
  driver_pay_per_mile numeric not null,
  hourly_operating_cost numeric not null,
  maintenance_per_mile numeric not null,

  -- outputs
  total_miles numeric not null,
  fuel_cost numeric not null,
  driver_pay numeric not null,
  maintenance_cost numeric not null,
  hourly_cost_total numeric not null,
  total_trip_cost numeric not null,
  net_profit numeric not null,
  profit_per_loaded_mile numeric not null,
  profit_per_hour numeric not null,

  created_at timestamptz default now() not null
);

alter table profit_calculations enable row level security;

create policy "Users can insert their own calculations"
  on profit_calculations for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own calculations"
  on profit_calculations for select
  using (auth.uid() = user_id);
