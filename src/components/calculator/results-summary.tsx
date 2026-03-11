"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent, formatCurrencyPerMile } from "@/lib/formatters";
import type { CalculationResult } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  result: CalculationResult;
}

export function ResultsSummary({ result }: Props) {
  const isProfitable = result.netProfit > 0;
  const isBreakEven = result.netProfit === 0 && result.grossRevenue === 0;

  return (
    <Card
      className={cn(
        "border-2",
        isBreakEven
          ? "border-border"
          : isProfitable
            ? "border-success/30"
            : "border-destructive/30"
      )}
    >
      <CardHeader>
        <CardTitle>Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Big number: Net Profit */}
        <div className="rounded-lg bg-secondary p-4 text-center">
          <p className="text-sm text-muted-foreground">Net Profit</p>
          <p
            className={cn(
              "text-3xl font-bold",
              isBreakEven
                ? "text-foreground"
                : isProfitable
                  ? "text-success"
                  : "text-destructive"
            )}
          >
            {formatCurrency(result.netProfit)}
          </p>
          <p
            className={cn(
              "text-sm font-medium",
              isBreakEven
                ? "text-muted-foreground"
                : isProfitable
                  ? "text-success"
                  : "text-destructive"
            )}
          >
            {formatPercent(result.profitMarginPercent)} margin
          </p>
        </div>

        {/* Revenue / Cost / Profit breakdown */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-secondary p-2">
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-sm font-semibold">
              {formatCurrency(result.grossRevenue)}
            </p>
          </div>
          <div className="rounded-md bg-secondary p-2">
            <p className="text-xs text-muted-foreground">Total Costs</p>
            <p className="text-sm font-semibold">
              {formatCurrency(result.totalCosts)}
            </p>
          </div>
          <div className="rounded-md bg-secondary p-2">
            <p className="text-xs text-muted-foreground">Total Miles</p>
            <p className="text-sm font-semibold">{result.totalMiles}</p>
          </div>
        </div>

        {/* Per-mile stats */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Per-Mile Breakdown</h4>
          <div className="space-y-1">
            <StatRow
              label="Revenue / Mile"
              value={formatCurrencyPerMile(result.revenuePerMile)}
            />
            <StatRow
              label="Cost / Mile"
              value={formatCurrencyPerMile(result.costPerMile)}
            />
            <StatRow
              label="Profit / Mile"
              value={formatCurrencyPerMile(result.profitPerMile)}
              className={isProfitable ? "text-success" : "text-destructive"}
            />
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Cost Breakdown</h4>
          <div className="space-y-1">
            <StatRow label="Fuel" value={formatCurrency(result.fuelCost)} />
            <StatRow
              label="Driver Pay"
              value={formatCurrency(result.driverPay)}
            />
            <StatRow
              label="Dispatch Fee"
              value={formatCurrency(result.dispatchFee)}
            />
            <StatRow label="Tolls" value={formatCurrency(result.tollsCost)} />
            <StatRow
              label="Insurance"
              value={formatCurrency(result.insuranceCost)}
            />
            <StatRow
              label="Maintenance"
              value={formatCurrency(result.maintenanceCost)}
            />
            {result.otherCosts > 0 && (
              <StatRow
                label="Other"
                value={formatCurrency(result.otherCosts)}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", className)}>{value}</span>
    </div>
  );
}
