export type DriverPayMethod =
  | "per_mile"
  | "percentage"
  | "hourly"
  | "salary"
  | "owner_draw";

export const DRIVER_PAY_METHODS: { value: DriverPayMethod; label: string; helper: string }[] = [
  {
    value: "per_mile",
    label: "Per mile",
    helper: "Driver paid a flat $/mile on total miles run.",
  },
  {
    value: "percentage",
    label: "Percentage of revenue",
    helper: "Driver paid a % of the linehaul rate on each load.",
  },
  {
    value: "hourly",
    label: "Hourly",
    helper: "Driver paid a flat $/hour for trip hours.",
  },
  {
    value: "salary",
    label: "Salary",
    helper: "Driver paid a fixed $/week. Prorated to each load by trip hours / standard week hours.",
  },
  {
    value: "owner_draw",
    label: "Owner draw",
    helper: "Owner-operator pays themselves a fixed $/week. Prorated to each load by trip hours / standard week hours.",
  },
];

// In-memory shape used in the form (numbers as strings to play nice with input fields).
export interface CostProfileFormState {
  name: string;
  isDefault: boolean;
  fixedCostPerDay: string;
  variableCostPerMile: string;
  mpg: string;
  defaultFuelPrice: string;
  driverPayMethod: DriverPayMethod;
  driverPayPerMile: string;
  driverPayPercentage: string;
  driverPayHourly: string;
  driverPaySalaryPerWeek: string;
  driverPayOwnerDrawPerWeek: string;
  standardWeekHours: string;
  factoringFeePct: string;
  targetProfitMarginPct: string;
}

// Validated/parsed shape used in calculations.
export interface CostProfile {
  id: string;
  name: string;
  isDefault: boolean;
  fixedCostPerDay: number;
  variableCostPerMile: number;
  mpg: number;
  defaultFuelPrice: number;
  driverPayMethod: DriverPayMethod;
  driverPayPerMile: number;
  driverPayPercentage: number;
  driverPayHourly: number;
  driverPaySalaryPerWeek: number;
  driverPayOwnerDrawPerWeek: number;
  standardWeekHours: number;
  factoringFeePct: number;
  targetProfitMarginPct: number;
}

// DB row shape (snake_case, as returned by Supabase).
export interface CostProfileRow {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  fixed_cost_per_day: number;
  variable_cost_per_mile: number;
  mpg: number;
  default_fuel_price: number;
  driver_pay_method: DriverPayMethod;
  driver_pay_per_mile: number;
  driver_pay_percentage: number;
  driver_pay_hourly: number;
  driver_pay_salary_per_week: number;
  driver_pay_owner_draw_per_week: number;
  standard_week_hours: number;
  factoring_fee_pct: number;
  target_profit_margin_pct: number;
  created_at: string;
  updated_at: string;
}

// Payload shape for POST/PUT API calls (snake_case, matches DB).
export interface CostProfileSavePayload {
  name: string;
  is_default: boolean;
  fixed_cost_per_day: number;
  variable_cost_per_mile: number;
  mpg: number;
  default_fuel_price: number;
  driver_pay_method: DriverPayMethod;
  driver_pay_per_mile: number;
  driver_pay_percentage: number;
  driver_pay_hourly: number;
  driver_pay_salary_per_week: number;
  driver_pay_owner_draw_per_week: number;
  standard_week_hours: number;
  factoring_fee_pct: number;
  target_profit_margin_pct: number;
}

// Reasonable starting values so a brand-new user isn't staring at an empty form.
export const DEFAULT_COST_PROFILE_FORM: CostProfileFormState = {
  name: "Default",
  isDefault: true,
  fixedCostPerDay: "200",
  variableCostPerMile: "0.15",
  mpg: "6.5",
  defaultFuelPrice: "3.89",
  driverPayMethod: "per_mile",
  driverPayPerMile: "0.55",
  driverPayPercentage: "25",
  driverPayHourly: "28",
  driverPaySalaryPerWeek: "1500",
  driverPayOwnerDrawPerWeek: "1500",
  standardWeekHours: "60",
  factoringFeePct: "3",
  targetProfitMarginPct: "15",
};

// Convert a row from the DB into the camelCase shape used in app code.
export function rowToCostProfile(row: CostProfileRow): CostProfile {
  return {
    id: row.id,
    name: row.name,
    isDefault: row.is_default,
    fixedCostPerDay: Number(row.fixed_cost_per_day),
    variableCostPerMile: Number(row.variable_cost_per_mile),
    mpg: Number(row.mpg),
    defaultFuelPrice: Number(row.default_fuel_price),
    driverPayMethod: row.driver_pay_method,
    driverPayPerMile: Number(row.driver_pay_per_mile),
    driverPayPercentage: Number(row.driver_pay_percentage),
    driverPayHourly: Number(row.driver_pay_hourly),
    driverPaySalaryPerWeek: Number(row.driver_pay_salary_per_week),
    driverPayOwnerDrawPerWeek: Number(row.driver_pay_owner_draw_per_week),
    standardWeekHours: Number(row.standard_week_hours),
    factoringFeePct: Number(row.factoring_fee_pct),
    targetProfitMarginPct: Number(row.target_profit_margin_pct),
  };
}

// Hydrate a form from an existing profile (e.g. when editing).
export function costProfileToFormState(profile: CostProfile): CostProfileFormState {
  return {
    name: profile.name,
    isDefault: profile.isDefault,
    fixedCostPerDay: String(profile.fixedCostPerDay),
    variableCostPerMile: String(profile.variableCostPerMile),
    mpg: String(profile.mpg),
    defaultFuelPrice: String(profile.defaultFuelPrice),
    driverPayMethod: profile.driverPayMethod,
    driverPayPerMile: String(profile.driverPayPerMile),
    driverPayPercentage: String(profile.driverPayPercentage),
    driverPayHourly: String(profile.driverPayHourly),
    driverPaySalaryPerWeek: String(profile.driverPaySalaryPerWeek),
    driverPayOwnerDrawPerWeek: String(profile.driverPayOwnerDrawPerWeek),
    standardWeekHours: String(profile.standardWeekHours),
    factoringFeePct: String(profile.factoringFeePct),
    targetProfitMarginPct: String(profile.targetProfitMarginPct),
  };
}
