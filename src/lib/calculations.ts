import type {
  RevenueInputs,
  CostInputs,
  CalculationResult,
  FuelCostInputs,
  FixedCosts,
  VariableCosts,
  OperatingProfile,
} from "@/types";
import { PROFIT_TARGET_PERCENT } from "./constants";

export function calculateFuelCost(fuel: FuelCostInputs): number {
  const totalMiles = fuel.loadedMiles + fuel.deadheadMiles;
  if (fuel.mpg <= 0) return 0;
  const gallonsNeeded = totalMiles / fuel.mpg;
  return gallonsNeeded * fuel.fuelPricePerGallon;
}

export function calculateGrossRevenue(revenue: RevenueInputs): number {
  const acc = revenue.accessorials;
  return (
    revenue.linehaulRate +
    revenue.fuelSurcharge +
    acc.detention +
    acc.lumper +
    acc.tonu +
    acc.layover +
    acc.other
  );
}

export function calculateDriverPay(
  costs: CostInputs,
  grossRevenue: number
): number {
  const totalMiles = costs.fuel.loadedMiles + costs.fuel.deadheadMiles;
  if (costs.driverPayType === "per_mile") {
    return costs.driverPayRate * totalMiles;
  }
  // percentage of linehaul
  return (costs.driverPayRate / 100) * grossRevenue;
}

export function calculateProfitability(
  revenue: RevenueInputs,
  costs: CostInputs
): CalculationResult {
  const totalMiles = costs.fuel.loadedMiles + costs.fuel.deadheadMiles;
  const grossRevenue = calculateGrossRevenue(revenue);
  const fuelCost = calculateFuelCost(costs.fuel);
  const driverPay = calculateDriverPay(costs, grossRevenue);
  const dispatchFee = (costs.dispatchFeePercent / 100) * grossRevenue;
  const tollsCost = costs.tolls;
  const insuranceCost = costs.insurancePerMile * totalMiles;
  const maintenanceCost = costs.maintenancePerMile * totalMiles;
  const otherCosts = costs.otherCosts;

  const totalCosts =
    fuelCost +
    driverPay +
    dispatchFee +
    tollsCost +
    insuranceCost +
    maintenanceCost +
    otherCosts;

  const netProfit = grossRevenue - totalCosts;
  const profitMarginPercent =
    grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
  const revenuePerMile = totalMiles > 0 ? grossRevenue / totalMiles : 0;
  const costPerMile = totalMiles > 0 ? totalCosts / totalMiles : 0;
  const profitPerMile = totalMiles > 0 ? netProfit / totalMiles : 0;

  return {
    grossRevenue,
    totalCosts,
    fuelCost,
    driverPay,
    dispatchFee,
    tollsCost,
    insuranceCost,
    maintenanceCost,
    otherCosts,
    netProfit,
    profitMarginPercent,
    revenuePerMile,
    costPerMile,
    profitPerMile,
    totalMiles,
  };
}

export function calculateBreakevenCostPerMile(
  fixed: FixedCosts,
  variable: VariableCosts,
  monthlyMiles: number
): number {
  if (monthlyMiles <= 0) return 0;
  const totalFixed =
    fixed.truckPayment +
    fixed.insurance +
    fixed.permits +
    fixed.parking +
    fixed.software +
    fixed.other;
  const totalVariable =
    variable.fuelPerMile +
    variable.maintenancePerMile +
    variable.tiresPerMile +
    variable.driverPayPerMile;
  return totalFixed / monthlyMiles + totalVariable;
}

export function estimateTripCost(
  profile: OperatingProfile,
  loadedMiles: number,
  deadheadMiles: number,
  fuelPrice: number,
  mpg: number = 6.5
): { totalCost: number; minimumRate: number; suggestedRate: number } {
  const totalMiles = loadedMiles + deadheadMiles;
  const breakevenPerMile = calculateBreakevenCostPerMile(
    profile.fixedCosts,
    profile.variableCosts,
    profile.estimatedMonthlyMiles
  );

  // Adjust fuel cost based on actual fuel price vs profile estimate
  const fuelCostDiff =
    fuelPrice / mpg - profile.variableCosts.fuelPerMile;
  const adjustedCostPerMile = breakevenPerMile + Math.max(0, fuelCostDiff);

  const totalCost = adjustedCostPerMile * totalMiles;
  const minimumRate = totalCost; // break-even
  const suggestedRate = totalCost * (1 + PROFIT_TARGET_PERCENT / 100);

  return { totalCost, minimumRate, suggestedRate };
}
