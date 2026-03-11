"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOperatingProfile } from "@/hooks/use-operating-profile";
import { useTripEstimates } from "@/hooks/use-trip-estimates";
import { estimateTripCost, calculateBreakevenCostPerMile } from "@/lib/calculations";
import { formatCurrency, formatCurrencyPerMile } from "@/lib/formatters";
import { AlertTriangle, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EstimatorPage() {
  const { profile, isLoaded } = useOperatingProfile();
  const { estimates, addEstimate, removeEstimate } = useTripEstimates();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [loadedMiles, setLoadedMiles] = useState(0);
  const [deadheadMiles, setDeadheadMiles] = useState(0);
  const [fuelPrice, setFuelPrice] = useState(3.85);
  const [mpg, setMpg] = useState(6.5);

  const tripResult = useMemo(() => {
    if (loadedMiles <= 0) return null;
    return estimateTripCost(profile, loadedMiles, deadheadMiles, fuelPrice, mpg);
  }, [profile, loadedMiles, deadheadMiles, fuelPrice, mpg]);

  const breakevenPerMile = useMemo(
    () =>
      calculateBreakevenCostPerMile(
        profile.fixedCosts,
        profile.variableCosts,
        profile.estimatedMonthlyMiles
      ),
    [profile]
  );

  const handleSave = () => {
    if (!tripResult) return;
    addEstimate({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      origin: origin || "N/A",
      destination: destination || "N/A",
      loadedMiles,
      deadheadMiles,
      estimatedFuelPrice: fuelPrice,
      estimatedTotalCost: tripResult.totalCost,
      minimumAcceptableRate: tripResult.minimumRate,
      suggestedRate: tripResult.suggestedRate,
    });
  };

  if (!isLoaded) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trip Cost Estimator</h1>
        <p className="text-muted-foreground">
          Estimate costs before accepting a load — know your minimum rate
        </p>
      </div>

      {/* Warning if using defaults */}
      <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p className="text-sm text-warning">
          Estimates use your Operating Cost Profile. Visit the{" "}
          <a href="/profile" className="font-medium underline">
            Cost Profile
          </a>{" "}
          page to customize your truck&apos;s actual costs for more accurate results.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trip inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
            <CardDescription>
              Your break-even cost: {formatCurrencyPerMile(breakevenPerMile)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Chicago, IL"
              />
              <Input
                label="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Dallas, TX"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Loaded Miles"
                type="number"
                min="0"
                value={loadedMiles || ""}
                onChange={(e) =>
                  setLoadedMiles(parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                suffix="mi"
              />
              <Input
                label="Deadhead Miles"
                type="number"
                min="0"
                value={deadheadMiles || ""}
                onChange={(e) =>
                  setDeadheadMiles(parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                suffix="mi"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fuel Price / Gal"
                prefix="$"
                type="number"
                step="0.01"
                min="0"
                value={fuelPrice || ""}
                onChange={(e) =>
                  setFuelPrice(parseFloat(e.target.value) || 0)
                }
                placeholder="3.85"
              />
              <Input
                label="MPG"
                type="number"
                step="0.1"
                min="0.1"
                value={mpg || ""}
                onChange={(e) => setMpg(parseFloat(e.target.value) || 6.5)}
                placeholder="6.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className={cn("border-2", tripResult ? "border-primary/30" : "border-border")}>
          <CardHeader>
            <CardTitle>Trip Estimate</CardTitle>
          </CardHeader>
          <CardContent>
            {tripResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-lg bg-secondary p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Estimated Trip Cost
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(tripResult.totalCost)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrencyPerMile(
                        tripResult.totalCost / (loadedMiles + deadheadMiles)
                      )}
                    </p>
                  </div>

                  <div className="rounded-lg bg-destructive/10 p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Minimum Acceptable Rate
                    </p>
                    <p className="text-2xl font-bold text-destructive">
                      {formatCurrency(tripResult.minimumRate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Break-even — no profit
                    </p>
                  </div>

                  <div className="rounded-lg bg-success/10 p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Suggested Rate (15% profit)
                    </p>
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(tripResult.suggestedRate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrencyPerMile(
                        tripResult.suggestedRate / (loadedMiles + deadheadMiles)
                      )}{" "}
                      all-in RPM
                    </p>
                  </div>
                </div>

                <Button onClick={handleSave} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Estimate
                </Button>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p>Enter loaded miles to see estimates</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Saved estimates */}
      {estimates.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Saved Estimates</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary">
                  <th className="px-4 py-2 text-left font-medium">Route</th>
                  <th className="px-4 py-2 text-right font-medium">Miles</th>
                  <th className="px-4 py-2 text-right font-medium">
                    Est. Cost
                  </th>
                  <th className="px-4 py-2 text-right font-medium">
                    Min Rate
                  </th>
                  <th className="px-4 py-2 text-right font-medium">
                    Suggested
                  </th>
                  <th className="px-4 py-2 text-center font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {estimates.map((est) => (
                  <tr
                    key={est.id}
                    className="border-b transition-colors hover:bg-secondary/50"
                  >
                    <td className="px-4 py-2">
                      <p className="font-medium">
                        {est.origin} → {est.destination}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(est.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {est.loadedMiles + est.deadheadMiles}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(est.estimatedTotalCost)}
                    </td>
                    <td className="px-4 py-2 text-right text-destructive">
                      {formatCurrency(est.minimumAcceptableRate)}
                    </td>
                    <td className="px-4 py-2 text-right text-success">
                      {formatCurrency(est.suggestedRate)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => removeEstimate(est.id)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="Delete estimate"
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
