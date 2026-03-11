"use client";

import { useState, useMemo } from "react";
import { RevenueInputs } from "@/components/calculator/revenue-inputs";
import { CostInputs } from "@/components/calculator/cost-inputs";
import { ResultsSummary } from "@/components/calculator/results-summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useCalculations } from "@/hooks/use-calculations";
import { calculateProfitability } from "@/lib/calculations";
import { DEFAULT_REVENUE, DEFAULT_COSTS } from "@/lib/constants";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import type { RevenueInputs as RevenueInputsType, CostInputs as CostInputsType } from "@/types";
import { Save, Trash2 } from "lucide-react";

export default function CalculatorPage() {
  const [revenue, setRevenue] = useState<RevenueInputsType>({
    ...DEFAULT_REVENUE,
    accessorials: { ...DEFAULT_REVENUE.accessorials },
  });
  const [costs, setCosts] = useState<CostInputsType>({
    ...DEFAULT_COSTS,
    fuel: { ...DEFAULT_COSTS.fuel },
  });
  const [loadName, setLoadName] = useState("");
  const { calculations, addCalculation, removeCalculation } = useCalculations();

  const result = useMemo(
    () => calculateProfitability(revenue, costs),
    [revenue, costs]
  );

  const handleSave = () => {
    const name =
      loadName.trim() ||
      `Load ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    addCalculation({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      name,
      revenue,
      costs,
      result,
    });
    setLoadName("");
  };

  const handleReset = () => {
    setRevenue({
      ...DEFAULT_REVENUE,
      accessorials: { ...DEFAULT_REVENUE.accessorials },
    });
    setCosts({
      ...DEFAULT_COSTS,
      fuel: { ...DEFAULT_COSTS.fuel },
    });
    setLoadName("");
  };

  const handleLoad = (calc: (typeof calculations)[0]) => {
    setRevenue(calc.revenue);
    setCosts(calc.costs);
    setLoadName(calc.name);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Load Profitability Calculator</h1>
        <p className="text-muted-foreground">
          Enter your load details to calculate profit and per-mile breakdown
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Left: inputs */}
        <div className="space-y-6">
          <RevenueInputs revenue={revenue} onChange={setRevenue} />
          <CostInputs costs={costs} onChange={setCosts} />

          {/* Save controls */}
          <Card>
            <CardContent className="flex flex-wrap items-end gap-3 p-4">
              <div className="flex-1">
                <Input
                  label="Load Name (optional)"
                  value={loadName}
                  onChange={(e) => setLoadName(e.target.value)}
                  placeholder="e.g. Chicago to Dallas"
                />
              </div>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: results (sticky on desktop) */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <ResultsSummary result={result} />
        </div>
      </div>

      {/* History */}
      {calculations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Saved Calculations</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary">
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-right font-medium">Revenue</th>
                  <th className="px-4 py-2 text-right font-medium">Costs</th>
                  <th className="px-4 py-2 text-right font-medium">Profit</th>
                  <th className="px-4 py-2 text-right font-medium">Margin</th>
                  <th className="px-4 py-2 text-right font-medium">RPM</th>
                  <th className="px-4 py-2 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {calculations.map((calc) => (
                  <tr
                    key={calc.id}
                    className="border-b transition-colors hover:bg-secondary/50"
                  >
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleLoad(calc)}
                        className="font-medium text-primary hover:underline"
                      >
                        {calc.name}
                      </button>
                      <p className="text-xs text-muted-foreground">
                        {new Date(calc.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(calc.result.grossRevenue)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(calc.result.totalCosts)}
                    </td>
                    <td
                      className={`px-4 py-2 text-right font-medium ${
                        calc.result.netProfit >= 0
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {formatCurrency(calc.result.netProfit)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatPercent(calc.result.profitMarginPercent)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(calc.result.revenuePerMile)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => removeCalculation(calc.id)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="Delete calculation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
