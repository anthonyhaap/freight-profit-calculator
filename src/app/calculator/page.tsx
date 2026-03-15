"use client";

import { useState } from "react";
import type { ProfitInput, ProfitResult } from "@/types/profit";
import { calculateFreightProfit } from "@/lib/calculations/freight-profit";
import { ProfitForm } from "@/components/calculator/profit-form";
import { ResultsCard } from "@/components/calculator/results-card";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function CalculatorPage() {
  const [validatedInput, setValidatedInput] = useState<ProfitInput | null>(null);
  const [result, setResult] = useState<ProfitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleCalculate(input: ProfitInput) {
    setError(null);
    setSaveStatus("idle");
    setSaveError(null);

    try {
      const calcResult = calculateFreightProfit(input);
      setValidatedInput(input);
      setResult(calcResult);
    } catch {
      setError("Calculation failed. Please check your inputs.");
      setResult(null);
      setValidatedInput(null);
    }
  }

  async function handleSave() {
    if (!validatedInput || !result) return;

    setSaveStatus("saving");
    setSaveError(null);

    try {
      const res = await fetch("/api/profit-calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          load_name: validatedInput.loadName,
          revenue: validatedInput.revenue,
          loaded_miles: validatedInput.loadedMiles,
          deadhead_miles: validatedInput.deadheadMiles,
          trip_hours: validatedInput.tripHours,
          fuel_price: validatedInput.fuelPrice,
          mpg: validatedInput.mpg,
          driver_pay_per_mile: validatedInput.driverPayPerMile,
          hourly_operating_cost: validatedInput.hourlyOperatingCost,
          maintenance_per_mile: validatedInput.maintenancePerMile,
          total_miles: result.totalMiles,
          fuel_cost: result.fuelCost,
          driver_pay: result.driverPay,
          maintenance_cost: result.maintenanceCost,
          hourly_cost_total: result.hourlyCostTotal,
          total_trip_cost: result.totalTripCost,
          net_profit: result.netProfit,
          profit_per_loaded_mile: result.profitPerLoadedMile,
          profit_per_hour: result.profitPerHour,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save calculation");
      }

      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "Failed to save calculation");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Freight Profit Calculator</h1>
          <p className="text-sm text-gray-600 mt-1">
            Enter your load details to calculate net profit, profit per mile, and profit per hour.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Load Details</h2>
            <ProfitForm onCalculate={handleCalculate} error={error} />
          </div>

          {/* Results */}
          <div>
            {result ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Results</h2>
                <ResultsCard result={result} />

                <div className="mt-6 pt-4 border-t">
                  <button
                    onClick={handleSave}
                    disabled={saveStatus === "saving" || saveStatus === "saved"}
                    className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 cursor-pointer ${
                      saveStatus === "saved"
                        ? "bg-green-600 text-white"
                        : saveStatus === "saving"
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500"
                    }`}
                  >
                    {saveStatus === "idle" && "Save Calculation"}
                    {saveStatus === "saving" && "Saving..."}
                    {saveStatus === "saved" && "Saved Successfully"}
                    {saveStatus === "error" && "Retry Save"}
                  </button>

                  {saveError && (
                    <p className="mt-2 text-sm text-red-600">{saveError}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center min-h-[300px]">
                <p className="text-gray-400 text-sm">
                  Enter load details and click Calculate to see results.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
