"use client";

import type { ProfitResult } from "@/types/profit";

interface ResultsCardProps {
  result: ProfitResult;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function ResultsCard({ result }: ResultsCardProps) {
  const profitColor = result.netProfit >= 0 ? "text-green-700" : "text-red-700";
  const profitBg = result.netProfit >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";

  return (
    <div className="space-y-6">
      {/* Cost Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Cost Breakdown
        </h3>
        <div className="space-y-2">
          <Row label="Total Miles" value={formatNumber(result.totalMiles)} />
          <Row label="Fuel Cost" value={formatCurrency(result.fuelCost)} />
          <Row label="Driver Pay" value={formatCurrency(result.driverPay)} />
          <Row label="Maintenance Cost" value={formatCurrency(result.maintenanceCost)} />
          <Row label="Hourly Cost Total" value={formatCurrency(result.hourlyCostTotal)} />
          <div className="border-t pt-2">
            <Row
              label="Total Trip Cost"
              value={formatCurrency(result.totalTripCost)}
              bold
            />
          </div>
        </div>
      </div>

      {/* Profitability */}
      <div className={`rounded-lg border p-4 ${profitBg}`}>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Profitability
        </h3>
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-sm text-gray-600">Net Profit</p>
            <p className={`text-3xl font-bold ${profitColor}`}>
              {formatCurrency(result.netProfit)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <p className="text-sm text-gray-600">Profit / Loaded Mile</p>
              <p className={`text-xl font-bold ${profitColor}`}>
                {formatCurrency(result.profitPerLoadedMile)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Profit / Hour</p>
              <p className={`text-xl font-bold ${profitColor}`}>
                {formatCurrency(result.profitPerHour)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${bold ? "font-semibold text-gray-900" : "text-gray-600"}`}>
        {label}
      </span>
      <span className={`text-sm ${bold ? "font-semibold text-gray-900" : "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}
