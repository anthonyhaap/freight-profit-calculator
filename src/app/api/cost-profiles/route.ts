import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { costProfileSavePayloadSchema } from "@/lib/validation/cost-profile-schema";

// GET /api/cost-profiles — list all profiles for the signed-in user.
// Default profile (if any) sorted first, then by created_at.
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in" },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("cost_profiles")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to load cost profiles" },
      { status: 500 }
    );
  }

  return NextResponse.json({ profiles: data ?? [] });
}

// POST /api/cost-profiles — create a new profile.
// If is_default = true, clears the default flag from any other profile first
// (the partial unique index would otherwise reject the insert).
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = costProfileSavePayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid cost profile data",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    if (parsed.data.is_default) {
      const { error: clearError } = await supabase
        .from("cost_profiles")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .eq("is_default", true);

      if (clearError) {
        return NextResponse.json(
          { error: "Failed to update default flag" },
          { status: 500 }
        );
      }
    }

    const { data, error } = await supabase
      .from("cost_profiles")
      .insert({ user_id: user.id, ...parsed.data })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to save cost profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: data });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
