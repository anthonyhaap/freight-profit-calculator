import { requireUser } from "@/lib/auth/require-user";
import { CalculatorClient } from "@/components/calculator/calculator-client";
import {
  rowToCostProfile,
  type CostProfile,
  type CostProfileRow,
} from "@/types/cost-profile";

export default async function CalculatorPage() {
  const { supabase } = await requireUser("/calculator");

  const { data } = await supabase
    .from("cost_profiles")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  const profiles: CostProfile[] =
    (data as CostProfileRow[] | null)?.map(rowToCostProfile) ?? [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Freight Profit Calculator</h1>
          <p className="text-sm text-gray-600 mt-1">
            Costs come from your cost profile. Just enter what's on the load and run it.
          </p>
        </div>
        <CalculatorClient profiles={profiles} />
      </div>
    </div>
  );
}
