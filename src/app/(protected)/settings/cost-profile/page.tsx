import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { CostProfilesManager } from "@/components/settings/cost-profiles-manager";
import {
  rowToCostProfile,
  type CostProfile,
  type CostProfileRow,
} from "@/types/cost-profile";

export default async function CostProfileSettingsPage() {
  const { supabase, user } = await requireUser("/settings/cost-profile");

  const { data, error } = await supabase
    .from("cost_profiles")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  const profiles: CostProfile[] =
    (data as CostProfileRow[] | null)?.map(rowToCostProfile) ?? [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cost Profile</h1>
            <p className="text-sm text-gray-600 mt-1">
              Set up your cost structure once. Every load calculation uses these
              numbers unless you override them.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Signed in as {user.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard"
              className="rounded-md border border-gray-300 bg-white text-gray-700 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 mb-4">
            <p className="text-sm text-red-700">
              Could not load cost profiles: {error.message}
            </p>
          </div>
        )}

        <CostProfilesManager initialProfiles={profiles} />
      </div>
    </div>
  );
}
