// === Accessorial Charges ===
export interface AccessorialCharges {
  detention: number;
  lumper: number;
  tonu: number; // Truck Order Not Used
  layover: number;
  other: number;
}

// === Revenue ===
export interface RevenueInputs {
  linehaulRate: number;
  fuelSurcharge: number;
  accessorials: AccessorialCharges;
}

// === Fuel Cost ===
export interface FuelCostInputs {
  mpg: number;
  fuelPricePerGallon: number;
  loadedMiles: number;
  deadheadMiles: number;
}

// === Driver Pay ===
export type DriverPayType = "per_mile" | "percentage";

// === Cost Inputs ===
export interface CostInputs {
  fuel: FuelCostInputs;
  driverPayType: DriverPayType;
  driverPayRate: number;
  tolls: number;
  insurancePerMile: number;
  maintenancePerMile: number;
  dispatchFeePercent: number;
  otherCosts: number;
}

// === Calculation Result ===
export interface CalculationResult {
  grossRevenue: number;
  totalCosts: number;
  fuelCost: number;
  driverPay: number;
  dispatchFee: number;
  tollsCost: number;
  insuranceCost: number;
  maintenanceCost: number;
  otherCosts: number;
  netProfit: number;
  profitMarginPercent: number;
  revenuePerMile: number;
  costPerMile: number;
  profitPerMile: number;
  totalMiles: number;
}

// === Saved Calculation ===
export interface SavedCalculation {
  id: string;
  createdAt: string;
  name: string;
  revenue: RevenueInputs;
  costs: CostInputs;
  result: CalculationResult;
}

// === Operating Cost Profile ===
export interface FixedCosts {
  truckPayment: number;
  insurance: number;
  permits: number;
  parking: number;
  software: number;
  other: number;
}

export interface VariableCosts {
  fuelPerMile: number;
  maintenancePerMile: number;
  tiresPerMile: number;
  driverPayPerMile: number;
}

export interface OperatingProfile {
  fixedCosts: FixedCosts;
  variableCosts: VariableCosts;
  estimatedMonthlyMiles: number;
}

// === Trip Estimate ===
export interface TripEstimate {
  id: string;
  createdAt: string;
  origin: string;
  destination: string;
  loadedMiles: number;
  deadheadMiles: number;
  estimatedFuelPrice: number;
  estimatedTotalCost: number;
  minimumAcceptableRate: number;
  suggestedRate: number;
}
