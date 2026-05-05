import { z } from "zod";

export const driverPayMethodEnum = z.enum([
  "per_mile",
  "percentage",
  "hourly",
  "salary",
  "owner_draw",
]);

// Schema used when validating the form on the client (camelCase keys).
export const costProfileSchema = z
  .object({
    name: z.string().min(1, "Profile name is required"),
    isDefault: z.boolean(),

    fixedCostPerDay: z.number().min(0, "Fixed cost per day cannot be negative"),
    variableCostPerMile: z.number().min(0, "Variable cost per mile cannot be negative"),

    mpg: z.number().positive("MPG must be greater than 0"),
    defaultFuelPrice: z.number().positive("Fuel price must be greater than 0"),

    driverPayMethod: driverPayMethodEnum,
    driverPayPerMile: z.number().min(0, "Driver pay per mile cannot be negative"),
    driverPayPercentage: z
      .number()
      .min(0, "Percentage cannot be negative")
      .max(100, "Percentage cannot exceed 100"),
    driverPayHourly: z.number().min(0, "Hourly rate cannot be negative"),
    driverPaySalaryPerWeek: z.number().min(0, "Salary cannot be negative"),
    driverPayOwnerDrawPerWeek: z.number().min(0, "Owner draw cannot be negative"),
    standardWeekHours: z.number().positive("Standard week hours must be greater than 0"),

    factoringFeePct: z
      .number()
      .min(0, "Factoring fee cannot be negative")
      .max(100, "Factoring fee cannot exceed 100"),

    targetProfitMarginPct: z
      .number()
      .min(0, "Target margin cannot be negative")
      .max(100, "Target margin cannot exceed 100"),
  })
  // Make sure the field that matches the chosen pay method actually has a non-zero value.
  // Zero is allowed in the DB (so you can set up a profile and tune later) but
  // when saving from the form we want to flag clearly broken combos.
  .refine(
    (v) => {
      switch (v.driverPayMethod) {
        case "per_mile":
          return v.driverPayPerMile > 0;
        case "percentage":
          return v.driverPayPercentage > 0;
        case "hourly":
          return v.driverPayHourly > 0;
        case "salary":
          return v.driverPaySalaryPerWeek > 0;
        case "owner_draw":
          return v.driverPayOwnerDrawPerWeek > 0;
      }
    },
    {
      message: "Enter a value for the selected driver pay method.",
      path: ["driverPayMethod"],
    }
  );

export type CostProfileSchemaInput = z.infer<typeof costProfileSchema>;

// Schema used on the API side (snake_case keys, matches DB column names).
export const costProfileSavePayloadSchema = z.object({
  name: z.string().min(1),
  is_default: z.boolean(),
  fixed_cost_per_day: z.number().min(0),
  variable_cost_per_mile: z.number().min(0),
  mpg: z.number().positive(),
  default_fuel_price: z.number().positive(),
  driver_pay_method: driverPayMethodEnum,
  driver_pay_per_mile: z.number().min(0),
  driver_pay_percentage: z.number().min(0).max(100),
  driver_pay_hourly: z.number().min(0),
  driver_pay_salary_per_week: z.number().min(0),
  driver_pay_owner_draw_per_week: z.number().min(0),
  standard_week_hours: z.number().positive(),
  factoring_fee_pct: z.number().min(0).max(100),
  target_profit_margin_pct: z.number().min(0).max(100),
});
