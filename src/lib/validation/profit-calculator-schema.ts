import { z } from "zod";

export const profitCalculatorSchema = z.object({
  loadName: z.string().min(1, "Load name is required"),
  revenue: z.number().positive("Revenue must be greater than 0"),
  loadedMiles: z.number().positive("Loaded miles must be greater than 0"),
  deadheadMiles: z.number().min(0, "Deadhead miles cannot be negative"),
  tripHours: z.number().positive("Trip hours must be greater than 0"),
  fuelPrice: z.number().positive("Fuel price must be greater than 0"),
  mpg: z.number().positive("MPG must be greater than 0"),
  driverPayPerMile: z.number().min(0, "Driver pay per mile cannot be negative"),
  hourlyOperatingCost: z.number().min(0, "Hourly operating cost cannot be negative"),
  maintenancePerMile: z.number().min(0, "Maintenance per mile cannot be negative"),
});

export type ProfitCalculatorInput = z.infer<typeof profitCalculatorSchema>;
