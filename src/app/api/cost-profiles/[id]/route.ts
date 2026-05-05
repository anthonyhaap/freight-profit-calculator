import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { costProfileSavePayloadSchema } from "@/lib/validation/cost-profile-schema";

// PUT /api/cost-profiles/[id] — update an existing profile.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // If this update marks the profile default, clear default from siblings first.
    if (parsed.data.is_default) {
      const { error: clearError } = await supabase
        .from("cost_profiles")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .eq("is_default", true)
        .neq("id", id);

      if (clearError) {
        return NextResponse.json(
          { error: "Failed to update default flag" },
          { status: 500 }
        );
      }
    }

    const { data, error } = await supabase
      .from("cost_profiles")
      .update(parsed.data)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Failed to update cost profile" },
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

// DELETE /api/cost-profiles/[id] — remove a profile.
// Note: this won't cascade to historical profit_calculations rows that reference
// this profile (we link by reference only, not foreign key, so deletes are safe).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { error } = await supabase
      .from("cost_profiles")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete cost profile" },
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
