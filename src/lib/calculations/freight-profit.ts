import type { ProfitInput, ProfitResult } from "@/types/profit";

export function calculateFreightProfit(input: ProfitInput): ProfitResult {
  const totalMiles = input.loadedMiles + input.deadheadMiles;
  const fuelCost = (totalMiles / input.mpg) * input.fuelPrice;
  const driverPay = totalMiles * input.driverPayPerMile;
  const maintenanceCost = totalMiles * input.maintenancePerMile;
  const hourlyCostTotal = input.tripHours * input.hourlyOperatingCost;
  const totalTripCost = fuelCost + driverPay + maintenanceCost + hourlyCostTotal;
  const netProfit = input.revenue - totalTripCost;
  const profitPerLoadedMile = input.loadedMiles > 0 ? netProfit / input.loadedMiles : 0;
  const profitPerHour = input.tripHours > 0 ? netProfit / input.tripHours : 0;

  return {
    totalMiles: round(totalMiles),
    fuelCost: round(fuelCost),
    driverPay: round(driverPay),
    maintenanceCost: round(maintenanceCost),
    hourlyCostTotal: round(hourlyCostTotal),
    totalTripCost: round(totalTripCost),
    netProfit: round(netProfit),
    profitPerLoadedMile: round(profitPerLoadedMile),
    profitPerHour: round(profitPerHour),
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
