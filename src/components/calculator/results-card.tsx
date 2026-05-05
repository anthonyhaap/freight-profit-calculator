import type { ProfitResult } from "@/types/profit";

interface ResultsCardProps {
  result: ProfitResult;
}

export function ResultsCard({ result }: ResultsCardProps) {
  const profitColor =
    result.netProfit >= 0 ? "text-green-700" : "text-red-700";
  const profitBg =
    result.netProfit >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";

  return (
    <div className="space-y-5">
      {/* Headline profit */}
      <div className={`rounded-md border p-4 ${profitBg}`}>
        <div className="text-xs uppercase tracking-wide text-gray-600">
          Net profit
        </div>
        <div className={`mt-1 text-3xl font-bold ${profitColor}`}>
          {fmtMoney(result.netProfit)}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-3 text-xs">
          <Stat label="Per loaded mile" value={fmtMoney(result.profitPerLoadedMile)} />
          <Stat label="Per total mile" value={fmtMoney(result.profitPerTotalMile)} />
          <Stat label="Per hour" value={fmtMoney(result.profitPerHour)} />
        </div>
      </div>

      {/* Revenue breakdown */}
      <Block title="Revenue">
        <Row label="Total revenue" value={fmtMoney(result.totalRevenue)} bold />
        <Row label="  • of which accessorials" value={fmtMoney(result.accessorialTotal)} muted />
      </Block>

      {/* Cost breakdown */}
      <Block title="Cost breakdown">
        <Row label="Fuel" value={fmtMoney(result.fuelCost)} />
        <Row label="Driver pay" value={fmtMoney(result.driverPay)} />
        <Row label="Variable cost (per-mile)" value={fmtMoney(result.variableCostTotal)} />
        <Row label="Fixed cost allocation" value={fmtMoney(result.fixedCostTotal)} />
        <Row label="Factoring fee" value={fmtMoney(result.factoringFeeAmount)} />
        <Row label="Total trip cost" value={fmtMoney(result.totalTripCost)} bold />
      </Block>

      <div className="text-xs text-gray-500">
        Total miles: {result.totalMiles.toFixed(1)}
      </div>
    </div>
  );
}

function fmtMoney(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2">{title}</h3>
      <div className="rounded-md border border-gray-200 divide-y divide-gray-100">
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between px-3 py-2 text-sm">
      <span className={muted ? "text-gray-500" : "text-gray-700"}>{label}</span>
      <span className={bold ? "font-semibold text-gray-900" : muted ? "text-gray-600" : "text-gray-900"}>
        {value}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="font-semibold text-gray-900">{value}</div>
    </div>
  );
}
