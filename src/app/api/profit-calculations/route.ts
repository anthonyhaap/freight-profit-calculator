import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const saveSchema = z.object({
  load_name: z.string().min(1),
  cost_profile_id: z.string().uuid().nullable(),
  origin: z.string().nullable(),
  destination: z.string().nullable(),

  loaded_miles: z.number(),
  deadhead_miles: z.number(),
  trip_hours: z.number(),

  linehaul_rate: z.number(),
  fuel_surcharge: z.number(),
  accessorial_detention: z.number(),
  accessorial_layover: z.number(),
  accessorial_tonu: z.number(),
  accessorial_stop_pay: z.number(),
  accessorial_tarp: z.number(),
  accessorial_lumper: z.number(),
  accessorial_total: z.number(),
  total_revenue: z.number(),

  tolls: z.number(),
  factoring_fee_pct: z.number(),
  factoring_fee_amount: z.number(),

  snapshot_fixed_cost_per_day: z.number(),
  snapshot_variable_cost_per_mile: z.number(),
  snapshot_mpg: z.number(),
  snapshot_fuel_price: z.number(),
  snapshot_driver_pay_method: z.enum([
    "per_mile", "percentage", "hourly", "salary", "owner_draw",
  ]),
  snapshot_driver_pay_per_mile: z.number(),
  snapshot_driver_pay_percentage: z.number(),
  snapshot_driver_pay_hourly: z.number(),
  snapshot_driver_pay_salary_per_week: z.number(),
  snapshot_driver_pay_owner_draw_per_week: z.number(),
  snapshot_standard_week_hours: z.number(),

  total_miles: z.number(),
  fuel_cost: z.number(),
  driver_pay: z.number(),
  fixed_cost_total: z.number(),
  variable_cost_total: z.number(),
  total_trip_cost: z.number(),
  net_profit: z.number(),
  profit_per_loaded_mile: z.number(),
  profit_per_total_mile: z.number(),
  profit_per_hour: z.number(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to save calculations" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = saveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid calculation data", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("profit_calculations").insert({
      user_id: user.id,
      ...parsed.data,
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to save calculation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
