import type { FixedCosts, VariableCosts, OperatingProfile, CostInputs, RevenueInputs, AccessorialCharges, FuelCostInputs } from "@/types";

export const DEFAULT_ACCESSORIALS: AccessorialCharges = {
  detention: 0,
  lumper: 0,
  tonu: 0,
  layover: 0,
  other: 0,
};

export const DEFAULT_FUEL_INPUTS: FuelCostInputs = {
  mpg: 6.5,
  fuelPricePerGallon: 3.85,
  loadedMiles: 0,
  deadheadMiles: 0,
};

export const DEFAULT_REVENUE: RevenueInputs = {
  linehaulRate: 0,
  fuelSurcharge: 0,
  accessorials: { ...DEFAULT_ACCESSORIALS },
};

export const DEFAULT_COSTS: CostInputs = {
  fuel: { ...DEFAULT_FUEL_INPUTS },
  driverPayType: "per_mile",
  driverPayRate: 0.60,
  tolls: 0,
  insurancePerMile: 0.06,
  maintenancePerMile: 0.15,
  dispatchFeePercent: 0,
  otherCosts: 0,
};

export const DEFAULT_FIXED_COSTS: FixedCosts = {
  truckPayment: 1800,
  insurance: 1200,
  permits: 250,
  parking: 200,
  software: 100,
  other: 0,
};

export const DEFAULT_VARIABLE_COSTS: VariableCosts = {
  fuelPerMile: 0.59,
  maintenancePerMile: 0.15,
  tiresPerMile: 0.04,
  driverPayPerMile: 0.60,
};

export const DEFAULT_OPERATING_PROFILE: OperatingProfile = {
  fixedCosts: { ...DEFAULT_FIXED_COSTS },
  variableCosts: { ...DEFAULT_VARIABLE_COSTS },
  estimatedMonthlyMiles: 10000,
};

export const PROFIT_TARGET_PERCENT = 15;
