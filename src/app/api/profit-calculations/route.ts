import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const saveSchema = z.object({
  load_name: z.string().min(1),
  revenue: z.number(),
  loaded_miles: z.number(),
  deadhead_miles: z.number(),
  trip_hours: z.number(),
  fuel_price: z.number(),
  mpg: z.number(),
  driver_pay_per_mile: z.number(),
  hourly_operating_cost: z.number(),
  maintenance_per_mile: z.number(),
  total_miles: z.number(),
  fuel_cost: z.number(),
  driver_pay: z.number(),
  maintenance_cost: z.number(),
  hourly_cost_total: z.number(),
  total_trip_cost: z.number(),
  net_profit: z.number(),
  profit_per_loaded_mile: z.number(),
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
        { error: "Invalid calculation data" },
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
