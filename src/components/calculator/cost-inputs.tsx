"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CostInputs as CostInputsType, DriverPayType } from "@/types";

interface Props {
  costs: CostInputsType;
  onChange: (costs: CostInputsType) => void;
}

export function CostInputs({ costs, onChange }: Props) {
  const updateFuel = (field: string, value: number) => {
    onChange({
      ...costs,
      fuel: { ...costs.fuel, [field]: value },
    });
  };

  const update = (field: string, value: number | string) => {
    onChange({ ...costs, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-destructive">Costs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Miles & Fuel */}
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Miles & Fuel
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Loaded Miles"
              type="number"
              min="0"
              value={costs.fuel.loadedMiles || ""}
              onChange={(e) =>
                updateFuel("loadedMiles", parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              suffix="mi"
            />
            <Input
              label="Deadhead Miles"
              type="number"
              min="0"
              value={costs.fuel.deadheadMiles || ""}
              onChange={(e) =>
                updateFuel("deadheadMiles", parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              suffix="mi"
            />
            <Input
              label="MPG"
              type="number"
              step="0.1"
              min="0.1"
              value={costs.fuel.mpg || ""}
              onChange={(e) =>
                updateFuel("mpg", parseFloat(e.target.value) || 6.5)
              }
              placeholder="6.5"
            />
            <Input
              label="Fuel Price / Gal"
              prefix="$"
              type="number"
              step="0.01"
              min="0"
              value={costs.fuel.fuelPricePerGallon || ""}
              onChange={(e) =>
                updateFuel(
                  "fuelPricePerGallon",
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder="3.85"
            />
          </div>
        </div>

        {/* Driver Pay */}
        <div className="border-t pt-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Driver Pay
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Pay Type"
              value={costs.driverPayType}
              onChange={(e) =>
                update("driverPayType", e.target.value as DriverPayType)
              }
              options={[
                { value: "per_mile", label: "Per Mile" },
                { value: "percentage", label: "% of Revenue" },
              ]}
            />
            <Input
              label={
                costs.driverPayType === "per_mile" ? "Rate / Mile" : "Percentage"
              }
              prefix={costs.driverPayType === "per_mile" ? "$" : undefined}
              suffix={costs.driverPayType === "percentage" ? "%" : undefined}
              type="number"
              step="0.01"
              min="0"
              value={costs.driverPayRate || ""}
              onChange={(e) =>
                update("driverPayRate", parseFloat(e.target.value) || 0)
              }
              placeholder={costs.driverPayType === "per_mile" ? "0.60" : "25"}
            />
          </div>
        </div>

        {/* Other Costs */}
        <div className="border-t pt-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Other Costs
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Input
              label="Tolls"
              prefix="$"
              type="number"
              step="0.01"
              min="0"
              value={costs.tolls || ""}
              onChange={(e) =>
                update("tolls", parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
            />
            <Input
              label="Insurance / Mile"
              prefix="$"
              type="number"
              step="0.01"
              min="0"
              value={costs.insurancePerMile || ""}
              onChange={(e) =>
                update("insurancePerMile", parseFloat(e.target.value) || 0)
              }
              placeholder="0.06"
            />
            <Input
              label="Maintenance / Mile"
              prefix="$"
              type="number"
              step="0.01"
              min="0"
              value={costs.maintenancePerMile || ""}
              onChange={(e) =>
                update("maintenancePerMile", parseFloat(e.target.value) || 0)
              }
              placeholder="0.15"
            />
            <Input
              label="Dispatch Fee"
              type="number"
              step="0.1"
              min="0"
              max="100"
              suffix="%"
              value={costs.dispatchFeePercent || ""}
              onChange={(e) =>
                update("dispatchFeePercent", parseFloat(e.target.value) || 0)
              }
              placeholder="0"
            />
            <Input
              label="Other Costs"
              prefix="$"
              type="number"
              step="0.01"
              min="0"
              value={costs.otherCosts || ""}
              onChange={(e) =>
                update("otherCosts", parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
