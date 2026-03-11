"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useOperatingProfile } from "@/hooks/use-operating-profile";
import { calculateBreakevenCostPerMile } from "@/lib/calculations";
import { formatCurrency, formatCurrencyPerMile } from "@/lib/formatters";
import type { FixedCosts, VariableCosts, OperatingProfile } from "@/types";

export default function ProfilePage() {
  const { profile, setProfile, isLoaded } = useOperatingProfile();

  const breakevenPerMile = useMemo(
    () =>
      calculateBreakevenCostPerMile(
        profile.fixedCosts,
        profile.variableCosts,
        profile.estimatedMonthlyMiles
      ),
    [profile]
  );

  const totalFixedMonthly = useMemo(
    () => Object.values(profile.fixedCosts).reduce((a, b) => a + b, 0),
    [profile.fixedCosts]
  );

  const totalVariablePerMile = useMemo(
    () => Object.values(profile.variableCosts).reduce((a, b) => a + b, 0),
    [profile.variableCosts]
  );

  const updateFixed = (field: keyof FixedCosts, value: number) => {
    setProfile({
      ...profile,
      fixedCosts: { ...profile.fixedCosts, [field]: value },
    } as OperatingProfile);
  };

  const updateVariable = (field: keyof VariableCosts, value: number) => {
    setProfile({
      ...profile,
      variableCosts: { ...profile.variableCosts, [field]: value },
    } as OperatingProfile);
  };

  if (!isLoaded) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Operating Cost Profile</h1>
        <p className="text-muted-foreground">
          Set up your truck&apos;s operating costs to get accurate estimates. Changes auto-save.
        </p>
      </div>

      {/* Break-even display */}
      <Card className="border-2 border-primary/30">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-4">
            <div className="rounded-lg bg-primary/10 p-4">
              <p className="text-sm text-muted-foreground">Break-Even Cost</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrencyPerMile(breakevenPerMile)}
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm text-muted-foreground">
                Fixed / Month
              </p>
              <p className="text-xl font-bold">
                {formatCurrency(totalFixedMonthly)}
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm text-muted-foreground">
                Variable / Mile
              </p>
              <p className="text-xl font-bold">
                {formatCurrencyPerMile(totalVariablePerMile)}
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm text-muted-foreground">
                Est. Monthly Miles
              </p>
              <p className="text-xl font-bold">
                {profile.estimatedMonthlyMiles.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fixed Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Fixed Monthly Costs</CardTitle>
            <CardDescription>
              Expenses that stay the same regardless of miles driven
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Truck Payment"
              prefix="$"
              type="number"
              step="1"
              min="0"
              value={profile.fixedCosts.truckPayment || ""}
              onChange={(e) =>
                updateFixed("truckPayment", parseFloat(e.target.value) || 0)
              }
              placeholder="1800"
              suffix="/mo"
            />
            <Input
              label="Insurance"
              prefix="$"
              type="number"
              step="1"
              min="0"
              value={profile.fixedCosts.insurance || ""}
              onChange={(e) =>
                updateFixed("insurance", parseFloat(e.target.value) || 0)
              }
              placeholder="1200"
              suffix="/mo"
            />
            <Input
              label="Permits & Licenses"
              prefix="$"
              type="number"
              step="1"
              min="0"
              value={profile.fixedCosts.permits || ""}
              onChange={(e) =>
                updateFixed("permits", parseFloat(e.target.value) || 0)
              }
              placeholder="250"
              suffix="/mo"
            />
            <Input
              label="Parking"
              prefix="$"
              type="number"
              step="1"
              min="0"
              value={profile.fixedCosts.parking || ""}
              onChange={(e) =>
                updateFixed("parking", parseFloat(e.target.value) || 0)
              }
              placeholder="200"
              suffix="/mo"
            />
            <Input
              label="Software & Subscriptions"
              prefix="$"
              type="number"
              step="1"
              min="0"
              value={profile.fixedCosts.software || ""}
              onChange={(e) =>
                updateFixed("software", parseFloat(e.target.value) || 0)
              }
              placeholder="100"
              suffix="/mo"
            />
            <Input
              label="Other Fixed"
              prefix="$"
              type="number"
              step="1"
              min="0"
              value={profile.fixedCosts.other || ""}
              onChange={(e) =>
                updateFixed("other", parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              suffix="/mo"
            />
          </CardContent>
        </Card>

        {/* Variable Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Variable Costs (Per Mile)</CardTitle>
            <CardDescription>
              Costs that increase with every mile you drive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Fuel Cost"
              prefix="$"
              type="number"
              step="0.01"
              min="0"
              value={profile.variableCosts.fuelPerMile || ""}
              onChange={(e) =>
                updateVariable("fuelPerMile", parseFloat(e.target.value) || 0)
              }
              placeholder="0.59"
              suffix="/mi"
            />
            <Input
              label="Maintenance"
              prefix="$"
              type="number"
              step="0.01"
              min="0"
              value={profile.variableCosts.maintenancePerMile || ""}
              onChange={(e) =>
                updateVariable(
                  "maintenancePerMile",
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder="0.15"
              suffix="/mi"
            />
            <Input
              label="Tires"
              prefix="$"
              type="number"
              step="0.01"
              min="0"
              value={profile.variableCosts.tiresPerMile || ""}
              onChange={(e) =>
                updateVariable("tiresPerMile", parseFloat(e.target.value) || 0)
              }
              placeholder="0.04"
              suffix="/mi"
            />
            <Input
              label="Driver Pay"
              prefix="$"
              type="number"
              step="0.01"
              min="0"
              value={profile.variableCosts.driverPayPerMile || ""}
              onChange={(e) =>
                updateVariable(
                  "driverPayPerMile",
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder="0.60"
              suffix="/mi"
            />

            <div className="border-t pt-4">
              <Input
                label="Estimated Monthly Miles"
                type="number"
                min="1"
                value={profile.estimatedMonthlyMiles || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    estimatedMonthlyMiles:
                      parseFloat(e.target.value) || 10000,
                  })
                }
                placeholder="10000"
                suffix="mi/mo"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
