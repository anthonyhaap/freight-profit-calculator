import { z } from "zod";

export const profitCalculatorSchema = z.object({
  loadName: z.string().min(1, "Load name is required"),
  costProfileId: z.string().uuid("Pick a cost profile"),

  origin: z.string().optional().default(""),
  destination: z.string().optional().default(""),

  loadedMiles: z.number().positive("Loaded miles must be greater than 0"),
  deadheadMiles: z.number().min(0, "Deadhead miles cannot be negative"),
  tripHours: z.number().positive("Trip hours must be greater than 0"),

  linehaulRate: z.number().positive("Linehaul rate must be greater than 0"),
  fuelSurcharge: z.number().min(0, "Fuel surcharge cannot be negative"),

  accessorialDetention: z.number().min(0),
  accessorialLayover: z.number().min(0),
  accessorialTonu: z.number().min(0),
  accessorialStopPay: z.number().min(0),
  accessorialTarp: z.number().min(0),
  accessorialLumper: z.number().min(0),

  tolls: z.number().min(0, "Tolls cannot be negative"),

  fuelPriceOverride: z.number().positive().nullable(),
  factoringFeePctOverride: z.number().min(0).max(100).nullable(),
});

export type ProfitCalculatorInput = z.infer<typeof profitCalculatorSchema>;
