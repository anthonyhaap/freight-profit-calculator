import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface LoadRow {
  id: string;
  load_name: string;
  revenue: number;
  total_miles: number;
  net_profit: number;
  profit_per_loaded_mile: number;
  profit_per_hour: number;
  created_at: string;
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function LoadsPage() {
  const supabase = await createClient();

  const { data: loads, error } = await supabase
    .from("profit_calculations")
    .select(
      "id, load_name, revenue, total_miles, net_profit, profit_per_loaded_mile, profit_per_hour, created_at"
    )
    .order("created_at", { ascending: false });

  const rows = (loads ?? []) as LoadRow[];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Saved loads</h1>
            <p className="text-sm text-gray-600 mt-1">
              {rows.length} {rows.length === 1 ? "load" : "loads"} saved
            </p>
          </div>
          <Link
            href="/calculator"
            className="rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800"
          >
            New calculation
          </Link>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4">
            Could not load rows: {error.message}
          </p>
        )}

        {rows.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 text-center">
            <p className="text-gray-600">
              You haven&apos;t saved any loads yet.{" "}
              <Link
                href="/calculator"
                className="text-gray-900 font-semibold underline"
              >
                Run your first calculation →
              </Link>
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Load</Th>
                    <Th>Date</Th>
                    <Th align="right">Revenue</Th>
                    <Th align="right">Miles</Th>
                    <Th align="right">Net profit</Th>
                    <Th align="right">$/loaded mi</Th>
                    <Th align="right">$/hr</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rows.map((row) => {
                    const profitable = Number(row.net_profit) >= 0;
                    return (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <Td>
                          <span className="font-medium text-gray-900">
                            {row.load_name}
                          </span>
                        </Td>
                        <Td>{dateFmt.format(new Date(row.created_at))}</Td>
                        <Td align="right">
                          {currency.format(Number(row.revenue))}
                        </Td>
                        <Td align="right">
                          {Number(row.total_miles).toLocaleString()}
                        </Td>
                        <Td align="right">
                          <span
                            className={
                              profitable
                                ? "text-green-700 font-semibold"
                                : "text-red-700 font-semibold"
                            }
                          >
                            {currency.format(Number(row.net_profit))}
                          </span>
                        </Td>
                        <Td align="right">
                          {currency.format(Number(row.profit_per_loaded_mile))}
                        </Td>
                        <Td align="right">
                          {currency.format(Number(row.profit_per_hour))}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`px-4 py-3 text-gray-700 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}
