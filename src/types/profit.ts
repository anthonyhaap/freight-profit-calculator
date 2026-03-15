export interface ProfitInput {
  loadName: string;
  revenue: number;
  loadedMiles: number;
  deadheadMiles: number;
  tripHours: number;
  fuelPrice: number;
  mpg: number;
  driverPayPerMile: number;
  hourlyOperatingCost: number;
  maintenancePerMile: number;
}

export interface ProfitResult {
  totalMiles: number;
  fuelCost: number;
  driverPay: number;
  maintenanceCost: number;
  hourlyCostTotal: number;
  totalTripCost: number;
  netProfit: number;
  profitPerLoadedMile: number;
  profitPerHour: number;
}

export interface ProfitFormState {
  loadName: string;
  revenue: string;
  loadedMiles: string;
  deadheadMiles: string;
  tripHours: string;
  fuelPrice: string;
  mpg: string;
  driverPayPerMile: string;
  hourlyOperatingCost: string;
  maintenancePerMile: string;
}

export interface SavePayload {
  load_name: string;
  revenue: number;
  loaded_miles: number;
  deadhead_miles: number;
  trip_hours: number;
  fuel_price: number;
  mpg: number;
  driver_pay_per_mile: number;
  hourly_operating_cost: number;
  maintenance_per_mile: number;
  total_miles: number;
  fuel_cost: number;
  driver_pay: number;
  maintenance_cost: number;
  hourly_cost_total: number;
  total_trip_cost: number;
  net_profit: number;
  profit_per_loaded_mile: number;
  profit_per_hour: number;
}
