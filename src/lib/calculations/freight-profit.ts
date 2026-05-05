import type { CostProfile } from "@/types/cost-profile";
import type {
  CostSnapshot,
  ProfitInput,
  ProfitResult,
} from "@/types/profit";

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Build a snapshot of cost values that apply to this load.
 * Per-load overrides (fuel price, factoring fee %) win over profile defaults.
 */
export function buildCostSnapshot(
  profile: CostProfile,
  input: ProfitInput
): CostSnapshot {
  return {
    fixedCostPerDay: profile.fixedCostPerDay,
    variableCostPerMile: profile.variableCostPerMile,
    mpg: profile.mpg,
    fuelPrice:
      input.fuelPriceOverride !== null
        ? input.fuelPriceOverride
        : profile.defaultFuelPrice,
    driverPayMethod: profile.driverPayMethod,
    driverPayPerMile: profile.driverPayPerMile,
    driverPayPercentage: profile.driverPayPercentage,
    driverPayHourly: profile.driverPayHourly,
    driverPaySalaryPerWeek: profile.driverPaySalaryPerWeek,
    driverPayOwnerDrawPerWeek: profile.driverPayOwnerDrawPerWeek,
    standardWeekHours: profile.standardWeekHours,
    factoringFeePct:
      input.factoringFeePctOverride !== null
        ? input.factoringFeePctOverride
        : profile.factoringFeePct,
  };
}

/**
 * Compute driver pay based on the chosen method.
 * - per_mile: $/mile × total miles
 * - percentage: % of linehaul (NOT total revenue — drivers usually quote on linehaul)
 * - hourly: $/hr × trip hours
 * - salary: weekly salary prorated by tripHours / standardWeekHours
 * - owner_draw: same proration as salary
 */
function computeDriverPay(
  snapshot: CostSnapshot,
  input: { totalMiles: number; tripHours: number; linehaulRate: number }
): number {
  switch (snapshot.driverPayMethod) {
    case "per_mile":
      return snapshot.driverPayPerMile * input.totalMiles;
    case "percentage":
      return (snapshot.driverPayPercentage / 100) * input.linehaulRate;
    case "hourly":
      return snapshot.driverPayHourly * input.tripHours;
    case "salary":
      return snapshot.standardWeekHours > 0
        ? (snapshot.driverPaySalaryPerWeek * input.tripHours) /
            snapshot.standardWeekHours
        : 0;
    case "owner_draw":
      return snapshot.standardWeekHours > 0
        ? (snapshot.driverPayOwnerDrawPerWeek * input.tripHours) /
            snapshot.standardWeekHours
        : 0;
  }
}

/**
 * Run the full profit calculation against a cost-snapshotted profile.
 * All money outputs are rounded to 2 decimals.
 */
export function calculateFreightProfit(
  input: ProfitInput,
  snapshot: CostSnapshot
): ProfitResult {
  const totalMiles = input.loadedMiles + input.deadheadMiles;

  // Revenue
  const accessorialTotal =
    input.accessorialDetention +
    input.accessorialLayover +
    input.accessorialTonu +
    input.accessorialStopPay +
    input.accessorialTarp +
    input.accessorialLumper;

  const totalRevenue = input.linehaulRate + input.fuelSurcharge + accessorialTotal;

  // Cost components
  const fuelCost =
    snapshot.mpg > 0 ? (totalMiles / snapshot.mpg) * snapshot.fuelPrice : 0;

  const driverPay = computeDriverPay(snapshot, {
    totalMiles,
    tripHours: input.tripHours,
    linehaulRate: input.linehaulRate,
  });

  const variableCostTotal = totalMiles * snapshot.variableCostPerMile;

  // Fixed cost is per-day; convert trip hours into a fractional day
  const tripDays = input.tripHours / 24;
  const fixedCostTotal = tripDays * snapshot.fixedCostPerDay;

  const factoringFeeAmount = (snapshot.factoringFeePct / 100) * totalRevenue;

  const totalTripCost =
    fuelCost +
    driverPay +
    variableCostTotal +
    fixedCostTotal +
    input.tolls +
    factoringFeeAmount;

  const netProfit = totalRevenue - totalTripCost;

  const profitPerLoadedMile =
    input.loadedMiles > 0 ? netProfit / input.loadedMiles : 0;
  const profitPerTotalMile = totalMiles > 0 ? netProfit / totalMiles : 0;
  const profitPerHour =
    input.tripHours > 0 ? netProfit / input.tripHours : 0;

  return {
    accessorialTotal: round2(accessorialTotal),
    totalRevenue: round2(totalRevenue),
    totalMiles: round2(totalMiles),
    fuelCost: round2(fuelCost),
    driverPay: round2(driverPay),
    fixedCostTotal: round2(fixedCostTotal),
    variableCostTotal: round2(variableCostTotal),
    factoringFeeAmount: round2(factoringFeeAmount),
    totalTripCost: round2(totalTripCost),
    netProfit: round2(netProfit),
    profitPerLoadedMile: round2(profitPerLoadedMile),
    profitPerTotalMile: round2(profitPerTotalMile),
    profitPerHour: round2(profitPerHour),
  };
}
