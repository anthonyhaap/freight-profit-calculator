import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Lightweight summary: total saved loads + sum of net profit for the user.
  const { data: loads, error } = await supabase
    .from("profit_calculations")
    .select("net_profit, created_at")
    .order("created_at", { ascending: false });

  const totalLoads = loads?.length ?? 0;
  const totalProfit =
    loads?.reduce((sum, l) => sum + Number(l.net_profit ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Signed in as {user?.email ?? "unknown"}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/calculator"
              className="rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800"
            >
              New calculation
            </Link>
            <Link
              href="/loads"
              className="rounded-md border border-gray-300 bg-white text-gray-700 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              View loads
            </Link>
            <Link
              href="/settings/cost-profile"
              className="rounded-md border border-gray-300 bg-white text-gray-700 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Cost profile
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Stat label="Saved loads" value={String(totalLoads)} />
          <Stat
            label="Lifetime net profit"
            value={totalProfit.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          />
        </div>

        {error && (
          <p className="mt-6 text-sm text-red-600">
            Could not load your data: {error.message}
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
