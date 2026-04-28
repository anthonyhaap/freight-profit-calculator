// 20 Test Loads for Freight Profit Calculator
// Runs the same calculation logic as the app

function calculateFreightProfit(input) {
  const totalMiles = input.loadedMiles + input.deadheadMiles;
  const fuelCost = (totalMiles / input.mpg) * input.fuelPrice;
  const driverPay = totalMiles * input.driverPayPerMile;
  const maintenanceCost = totalMiles * input.maintenancePerMile;
  const hourlyCostTotal = input.tripHours * input.hourlyOperatingCost;
  const totalTripCost = fuelCost + driverPay + maintenanceCost + hourlyCostTotal;
  const netProfit = input.revenue - totalTripCost;
  const profitPerLoadedMile = input.loadedMiles > 0 ? netProfit / input.loadedMiles : 0;
  const profitPerHour = input.tripHours > 0 ? netProfit / input.tripHours : 0;

  const r = (v) => Math.round(v * 100) / 100;
  return {
    totalMiles: r(totalMiles),
    fuelCost: r(fuelCost),
    driverPay: r(driverPay),
    maintenanceCost: r(maintenanceCost),
    hourlyCostTotal: r(hourlyCostTotal),
    totalTripCost: r(totalTripCost),
    netProfit: r(netProfit),
    profitPerLoadedMile: r(profitPerLoadedMile),
    profitPerHour: r(profitPerHour),
  };
}

const testLoads = [
  // 1. Solid mid-haul with good rate
  { loadName: "Dallas TX → Chicago IL", revenue: 3500, loadedMiles: 920, deadheadMiles: 45, tripHours: 16, fuelPrice: 3.89, mpg: 6.5, driverPayPerMile: 0.55, hourlyOperatingCost: 25, maintenancePerMile: 0.12 },
  // 2. Short high-rate local haul
  { loadName: "Houston TX → San Antonio TX", revenue: 1200, loadedMiles: 200, deadheadMiles: 10, tripHours: 4, fuelPrice: 3.75, mpg: 6.0, driverPayPerMile: 0.60, hourlyOperatingCost: 28, maintenancePerMile: 0.14 },
  // 3. Long cross-country run
  { loadName: "Los Angeles CA → Atlanta GA", revenue: 7200, loadedMiles: 2175, deadheadMiles: 120, tripHours: 38, fuelPrice: 4.15, mpg: 6.2, driverPayPerMile: 0.52, hourlyOperatingCost: 22, maintenancePerMile: 0.11 },
  // 4. Northeast corridor - decent rate
  { loadName: "Newark NJ → Boston MA", revenue: 1100, loadedMiles: 215, deadheadMiles: 30, tripHours: 5, fuelPrice: 4.25, mpg: 5.8, driverPayPerMile: 0.58, hourlyOperatingCost: 30, maintenancePerMile: 0.13 },
  // 5. Midwest grain haul - low rate
  { loadName: "Omaha NE → Minneapolis MN", revenue: 1400, loadedMiles: 475, deadheadMiles: 85, tripHours: 9, fuelPrice: 3.65, mpg: 6.8, driverPayPerMile: 0.48, hourlyOperatingCost: 20, maintenancePerMile: 0.10 },
  // 6. High-paying expedited load
  { loadName: "Memphis TN → Detroit MI (Expedited)", revenue: 4800, loadedMiles: 756, deadheadMiles: 25, tripHours: 12, fuelPrice: 3.95, mpg: 6.3, driverPayPerMile: 0.65, hourlyOperatingCost: 35, maintenancePerMile: 0.15 },
  // 7. West coast short haul
  { loadName: "Portland OR → Seattle WA", revenue: 650, loadedMiles: 175, deadheadMiles: 5, tripHours: 3.5, fuelPrice: 4.35, mpg: 6.0, driverPayPerMile: 0.55, hourlyOperatingCost: 25, maintenancePerMile: 0.12 },
  // 8. Florida run - moderate
  { loadName: "Jacksonville FL → Miami FL", revenue: 1350, loadedMiles: 345, deadheadMiles: 60, tripHours: 7, fuelPrice: 3.80, mpg: 6.4, driverPayPerMile: 0.50, hourlyOperatingCost: 24, maintenancePerMile: 0.11 },
  // 9. Bad deadhead load - barely profitable
  { loadName: "Phoenix AZ → El Paso TX", revenue: 1100, loadedMiles: 430, deadheadMiles: 180, tripHours: 11, fuelPrice: 4.05, mpg: 6.1, driverPayPerMile: 0.53, hourlyOperatingCost: 26, maintenancePerMile: 0.13 },
  // 10. Money-losing load (too cheap for distance)
  { loadName: "Denver CO → Salt Lake City UT", revenue: 800, loadedMiles: 525, deadheadMiles: 95, tripHours: 10, fuelPrice: 3.90, mpg: 5.9, driverPayPerMile: 0.55, hourlyOperatingCost: 25, maintenancePerMile: 0.12 },
  // 11. Team driver cross-country premium
  { loadName: "New York NY → Los Angeles CA (Team)", revenue: 12500, loadedMiles: 2790, deadheadMiles: 50, tripHours: 44, fuelPrice: 4.10, mpg: 6.0, driverPayPerMile: 0.70, hourlyOperatingCost: 40, maintenancePerMile: 0.14 },
  // 12. Reefer load - produce run
  { loadName: "Salinas CA → Dallas TX (Reefer)", revenue: 5800, loadedMiles: 1575, deadheadMiles: 75, tripHours: 26, fuelPrice: 4.20, mpg: 5.5, driverPayPerMile: 0.55, hourlyOperatingCost: 32, maintenancePerMile: 0.16 },
  // 13. Flatbed heavy haul
  { loadName: "Pittsburgh PA → Charlotte NC (Flatbed)", revenue: 3200, loadedMiles: 460, deadheadMiles: 35, tripHours: 9, fuelPrice: 3.85, mpg: 5.2, driverPayPerMile: 0.62, hourlyOperatingCost: 30, maintenancePerMile: 0.18 },
  // 14. Short drayage move
  { loadName: "Port of Savannah → Warehouse (Dray)", revenue: 450, loadedMiles: 35, deadheadMiles: 15, tripHours: 2.5, fuelPrice: 3.90, mpg: 4.5, driverPayPerMile: 0.55, hourlyOperatingCost: 28, maintenancePerMile: 0.12 },
  // 15. Midwest to Southeast
  { loadName: "Indianapolis IN → Nashville TN", revenue: 1650, loadedMiles: 290, deadheadMiles: 40, tripHours: 6, fuelPrice: 3.70, mpg: 6.5, driverPayPerMile: 0.52, hourlyOperatingCost: 24, maintenancePerMile: 0.11 },
  // 16. High-fuel-cost California run
  { loadName: "San Francisco CA → San Diego CA", revenue: 1500, loadedMiles: 505, deadheadMiles: 70, tripHours: 10, fuelPrice: 5.15, mpg: 6.0, driverPayPerMile: 0.58, hourlyOperatingCost: 28, maintenancePerMile: 0.13 },
  // 17. Oversize load premium
  { loadName: "Houston TX → Oklahoma City OK (OD)", revenue: 5500, loadedMiles: 480, deadheadMiles: 20, tripHours: 14, fuelPrice: 3.85, mpg: 4.8, driverPayPerMile: 0.70, hourlyOperatingCost: 45, maintenancePerMile: 0.20 },
  // 18. Backhaul rate - low revenue
  { loadName: "Laredo TX → Dallas TX (Backhaul)", revenue: 750, loadedMiles: 440, deadheadMiles: 0, tripHours: 7, fuelPrice: 3.75, mpg: 6.5, driverPayPerMile: 0.50, hourlyOperatingCost: 22, maintenancePerMile: 0.10 },
  // 19. LTL consolidated load
  { loadName: "Chicago IL → St. Louis MO (LTL)", revenue: 900, loadedMiles: 300, deadheadMiles: 20, tripHours: 6, fuelPrice: 3.80, mpg: 6.2, driverPayPerMile: 0.50, hourlyOperatingCost: 24, maintenancePerMile: 0.11 },
  // 20. Premium hazmat load
  { loadName: "Baton Rouge LA → Houston TX (Hazmat)", revenue: 3000, loadedMiles: 275, deadheadMiles: 15, tripHours: 5.5, fuelPrice: 3.90, mpg: 5.8, driverPayPerMile: 0.68, hourlyOperatingCost: 38, maintenancePerMile: 0.17 },
];

const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtD = (n) => "$" + fmt(n);

console.log("=".repeat(120));
console.log("  FREIGHT PROFIT CALCULATOR — 20 TEST LOADS");
console.log("=".repeat(120));

let totalProfit = 0;
let profitable = 0;
let unprofitable = 0;

const results = testLoads.map((load, i) => {
  const result = calculateFreightProfit(load);
  totalProfit += result.netProfit;
  if (result.netProfit >= 0) profitable++;
  else unprofitable++;
  return { load, result, index: i + 1 };
});

// Detailed results for each load
results.forEach(({ load, result, index }) => {
  const status = result.netProfit >= 0 ? "PROFIT" : "LOSS";
  const rpm = load.loadedMiles > 0 ? (load.revenue / load.loadedMiles).toFixed(2) : "N/A";

  console.log(`\n${"─".repeat(120)}`);
  console.log(`  LOAD #${index}: ${load.loadName}`);
  console.log(`${"─".repeat(120)}`);

  console.log(`  INPUTS:`);
  console.log(`    Revenue: ${fmtD(load.revenue)}    Rate/mi: $${rpm}    Loaded: ${fmt(load.loadedMiles)} mi    Deadhead: ${fmt(load.deadheadMiles)} mi    Hours: ${load.tripHours}`);
  console.log(`    Fuel: $${load.fuelPrice}/gal    MPG: ${load.mpg}    Driver: $${load.driverPayPerMile}/mi    Op Cost: $${load.hourlyOperatingCost}/hr    Maint: $${load.maintenancePerMile}/mi`);

  console.log(`  COSTS:`);
  console.log(`    Total Miles: ${fmt(result.totalMiles)}    Fuel: ${fmtD(result.fuelCost)}    Driver Pay: ${fmtD(result.driverPay)}    Maintenance: ${fmtD(result.maintenanceCost)}    Hourly: ${fmtD(result.hourlyCostTotal)}`);
  console.log(`    Total Trip Cost: ${fmtD(result.totalTripCost)}`);

  console.log(`  RESULT: [${status}]  Net: ${fmtD(result.netProfit)}    $/loaded mi: ${fmtD(result.profitPerLoadedMile)}    $/hr: ${fmtD(result.profitPerHour)}`);
});

// Summary table
console.log(`\n${"=".repeat(120)}`);
console.log("  SUMMARY TABLE");
console.log("=".repeat(120));
console.log(
  "  #".padEnd(5) +
  "Load".padEnd(45) +
  "Revenue".padStart(11) +
  "Trip Cost".padStart(12) +
  "Net Profit".padStart(12) +
  "$/Loaded Mi".padStart(12) +
  "$/Hour".padStart(10) +
  "  Status"
);
console.log("  " + "─".repeat(115));

results.forEach(({ load, result, index }) => {
  const status = result.netProfit >= 0 ? "PROFIT" : " LOSS ";
  console.log(
    `  ${String(index).padEnd(4)}` +
    `${load.loadName.substring(0, 43).padEnd(45)}` +
    `${fmtD(load.revenue).padStart(11)}` +
    `${fmtD(result.totalTripCost).padStart(12)}` +
    `${fmtD(result.netProfit).padStart(12)}` +
    `${fmtD(result.profitPerLoadedMile).padStart(12)}` +
    `${fmtD(result.profitPerHour).padStart(10)}` +
    `  ${status}`
  );
});

console.log("  " + "─".repeat(115));
console.log(`\n  TOTALS:`);
console.log(`    Total Net Profit:  ${fmtD(totalProfit)}`);
console.log(`    Average Per Load:  ${fmtD(totalProfit / 20)}`);
console.log(`    Profitable Loads:  ${profitable} / 20`);
console.log(`    Unprofitable:      ${unprofitable} / 20`);
console.log(`    Profit Rate:       ${((profitable / 20) * 100).toFixed(0)}%`);
console.log("=".repeat(120));
