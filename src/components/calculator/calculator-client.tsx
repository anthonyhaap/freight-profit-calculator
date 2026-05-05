"use client";

import { useState } from "react";
import type { CostProfile } from "@/types/cost-profile";
import type { ProfitInput, ProfitResult, SavePayload } from "@/types/profit";
import { ProfitForm } from "./profit-form";
import { ResultsCard } from "./results-card";
import {
  buildCostSnapshot,
  calculateFreightProfit,
} from "@/lib/calculations/freight-profit";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface CalculatorClientProps {
  profiles: CostProfile[];
}

export function CalculatorClient({ profiles }: CalculatorClientProps) {
  const [validatedInput, setValidatedInput] = useState<ProfitInput | null>(null);
  const [usedProfile, setUsedProfile] = useState<CostProfile | null>(null);
  const [result, setResult] = useState<ProfitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleCalculate(input: ProfitInput, profile: CostProfile) {
    setError(null);
    setSaveStatus("idle");
    setSaveError(null);

    try {
      const snapshot = buildCostSnapshot(profile, input);
      const calc = calculateFreightProfit(input, snapshot);
      setValidatedInput(input);
      setUsedProfile(profile);
      setResult(calc);
    } catch {
      setError("Calculation failed. Please check your inputs.");
      setResult(null);
      setValidatedInput(null);
    }
  }

  async function handleSave() {
    if (!validatedInput || !result || !usedProfile) return;

    setSaveStatus("saving");
    setSaveError(null);

    const snapshot = buildCostSnapshot(usedProfile, validatedInput);

    const payload: SavePayload = {
      load_name: validatedInput.loadName,
      cost_profile_id: validatedInput.costProfileId,
      origin: validatedInput.origin || null,
      destination: validatedInput.destination || null,

      loaded_miles: validatedInput.loadedMiles,
      deadhead_miles: validatedInput.deadheadMiles,
      trip_hours: validatedInput.tripHours,

      linehaul_rate: validatedInput.linehaulRate,
      fuel_surcharge: validatedInput.fuelSurcharge,
      accessorial_detention: validatedInput.accessorialDetention,
      accessorial_layover: validatedInput.accessorialLayover,
      accessorial_tonu: validatedInput.accessorialTonu,
      accessorial_stop_pay: validatedInput.accessorialStopPay,
      accessorial_tarp: validatedInput.accessorialTarp,
      accessorial_lumper: validatedInput.accessorialLumper,
      accessorial_total: result.accessorialTotal,
      total_revenue: result.totalRevenue,

      tolls: validatedInput.tolls,
      factoring_fee_pct: snapshot.factoringFeePct,
      factoring_fee_amount: result.factoringFeeAmount,

      snapshot_fixed_cost_per_day: snapshot.fixedCostPerDay,
      snapshot_variable_cost_per_mile: snapshot.variableCostPerMile,
      snapshot_mpg: snapshot.mpg,
      snapshot_fuel_price: snapshot.fuelPrice,
      snapshot_driver_pay_method: snapshot.driverPayMethod,
      snapshot_driver_pay_per_mile: snapshot.driverPayPerMile,
      snapshot_driver_pay_percentage: snapshot.driverPayPercentage,
      snapshot_driver_pay_hourly: snapshot.driverPayHourly,
      snapshot_driver_pay_salary_per_week: snapshot.driverPaySalaryPerWeek,
      snapshot_driver_pay_owner_draw_per_week: snapshot.driverPayOwnerDrawPerWeek,
      snapshot_standard_week_hours: snapshot.standardWeekHours,

      total_miles: result.totalMiles,
      fuel_cost: result.fuelCost,
      driver_pay: result.driverPay,
      fixed_cost_total: result.fixedCostTotal,
      variable_cost_total: result.variableCostTotal,
      total_trip_cost: result.totalTripCost,
      net_profit: result.netProfit,
      profit_per_loaded_mile: result.profitPerLoadedMile,
      profit_per_total_mile: result.profitPerTotalMile,
      profit_per_hour: result.profitPerHour,
    };

    try {
      const res = await fetch("/api/profit-calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save calculation");
      }
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "Failed to save calculation");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Load details</h2>
        <ProfitForm profiles={profiles} onCalculate={handleCalculate} error={error} />
      </div>

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
                {saveStatus === "idle" && "Save calculation"}
                {saveStatus === "saving" && "Saving..."}
                {saveStatus === "saved" && "Saved"}
                {saveStatus === "error" && "Retry save"}
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
  );
}
