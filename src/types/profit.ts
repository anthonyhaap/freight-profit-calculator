import type { DriverPayMethod } from "./cost-profile";

// User-entered facts about a single load.
export interface ProfitInput {
  loadName: string;
  costProfileId: string;
  origin: string;
  destination: string;

  // Lane / time
  loadedMiles: number;
  deadheadMiles: number;
  tripHours: number;

  // Revenue
  linehaulRate: number;
  fuelSurcharge: number;
  accessorialDetention: number;
  accessorialLayover: number;
  accessorialTonu: number;
  accessorialStopPay: number;
  accessorialTarp: number;
  accessorialLumper: number;

  // Direct trip costs
  tolls: number;

  // Optional per-load overrides (null = use profile default)
  fuelPriceOverride: number | null;
  factoringFeePctOverride: number | null;
}

// Cost values used at calc time. We snapshot these so historical loads stay
// stable when the user later edits their cost profile.
export interface CostSnapshot {
  fixedCostPerDay: number;
  variableCostPerMile: number;
  mpg: number;
  fuelPrice: number;
  driverPayMethod: DriverPayMethod;
  driverPayPerMile: number;
  driverPayPercentage: number;
  driverPayHourly: number;
  driverPaySalaryPerWeek: number;
  driverPayOwnerDrawPerWeek: number;
  standardWeekHours: number;
  factoringFeePct: number;
}

// Computed output for a calculation.
export interface ProfitResult {
  // Revenue side
  accessorialTotal: number;
  totalRevenue: number;

  // Cost side
  totalMiles: number;
  fuelCost: number;
  driverPay: number;
  fixedCostTotal: number;
  variableCostTotal: number;
  factoringFeeAmount: number;
  totalTripCost: number;

  // Profitability
  netProfit: number;
  profitPerLoadedMile: number;
  profitPerTotalMile: number;
  profitPerHour: number;
}

// Form state (string-typed because it lives in inputs).
export interface ProfitFormState {
  loadName: string;
  costProfileId: string;
  origin: string;
  destination: string;
  loadedMiles: string;
  deadheadMiles: string;
  tripHours: string;
  linehaulRate: string;
  fuelSurcharge: string;
  accessorialDetention: string;
  accessorialLayover: string;
  accessorialTonu: string;
  accessorialStopPay: string;
  accessorialTarp: string;
  accessorialLumper: string;
  tolls: string;
  fuelPriceOverride: string;
  factoringFeePctOverride: string;
}

export const INITIAL_PROFIT_FORM: ProfitFormState = {
  loadName: "",
  costProfileId: "",
  origin: "",
  destination: "",
  loadedMiles: "",
  deadheadMiles: "",
  tripHours: "",
  linehaulRate: "",
  fuelSurcharge: "",
  accessorialDetention: "",
  accessorialLayover: "",
  accessorialTonu: "",
  accessorialStopPay: "",
  accessorialTarp: "",
  accessorialLumper: "",
  tolls: "",
  fuelPriceOverride: "",
  factoringFeePctOverride: "",
};

// DB-shaped payload for saves (snake_case, matches columns).
export interface SavePayload {
  load_name: string;
  cost_profile_id: string | null;
  origin: string | null;
  destination: string | null;

  loaded_miles: number;
  deadhead_miles: number;
  trip_hours: number;

  linehaul_rate: number;
  fuel_surcharge: number;
  accessorial_detention: number;
  accessorial_layover: number;
  accessorial_tonu: number;
  accessorial_stop_pay: number;
  accessorial_tarp: number;
  accessorial_lumper: number;
  accessorial_total: number;
  total_revenue: number;

  tolls: number;
  factoring_fee_pct: number;
  factoring_fee_amount: number;

  // Cost snapshot
  snapshot_fixed_cost_per_day: number;
  snapshot_variable_cost_per_mile: number;
  snapshot_mpg: number;
  snapshot_fuel_price: number;
  snapshot_driver_pay_method: DriverPayMethod;
  snapshot_driver_pay_per_mile: number;
  snapshot_driver_pay_percentage: number;
  snapshot_driver_pay_hourly: number;
  snapshot_driver_pay_salary_per_week: number;
  snapshot_driver_pay_owner_draw_per_week: number;
  snapshot_standard_week_hours: number;

  // Computed
  total_miles: number;
  fuel_cost: number;
  driver_pay: number;
  fixed_cost_total: number;
  variable_cost_total: number;
  total_trip_cost: number;
  net_profit: number;
  profit_per_loaded_mile: number;
  profit_per_total_mile: number;
  profit_per_hour: number;
}
