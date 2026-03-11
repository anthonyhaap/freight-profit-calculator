"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { RevenueInputs as RevenueInputsType } from "@/types";

interface Props {
  revenue: RevenueInputsType;
  onChange: (revenue: RevenueInputsType) => void;
}

export function RevenueInputs({ revenue, onChange }: Props) {
  const update = (field: string, value: number) => {
    onChange({ ...revenue, [field]: value });
  };

  const updateAccessorial = (field: string, value: number) => {
    onChange({
      ...revenue,
      accessorials: { ...revenue.accessorials, [field]: value },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-success">Revenue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Linehaul Rate"
            prefix="$"
            type="number"
            step="0.01"
            min="0"
            value={revenue.linehaulRate || ""}
            onChange={(e) =>
              update("linehaulRate", parseFloat(e.target.value) || 0)
            }
            placeholder="0.00"
          />
          <Input
            label="Fuel Surcharge"
            prefix="$"
            type="number"
            step="0.01"
            min="0"
            value={revenue.fuelSurcharge || ""}
            onChange={(e) =>
              update("fuelSurcharge", parseFloat(e.target.value) || 0)
            }
            placeholder="0.00"
          />
        </div>

        <div className="border-t pt-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Accessorial Charges
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Input
              label="Detention"
              prefix="$"
              type="number"
              step="0.01"
              min="0"
              value={revenue.accessorials.detention || ""}
              onChange={(e) =>
                updateAccessorial("detention", parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
            />
            <Input
              label="Lumper"
              prefix="$"
              type="number"
              step="0.01"
              min="0"
              value={revenue.accessorials.lumper || ""}
              onChange={(e) =>
                updateAccessorial("lumper", parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
            />
            <Input
              label="TONU"
              prefix="$"
              type="number"
              step="0.01"
              min="0"
              value={revenue.accessorials.tonu || ""}
              onChange={(e) =>
                updateAccessorial("tonu", parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
            />
            <Input
              label="Layover"
              prefix="$"
              type="number"
              step="0.01"
              min="0"
              value={revenue.accessorials.layover || ""}
              onChange={(e) =>
                updateAccessorial("layover", parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
            />
            <Input
              label="Other"
              prefix="$"
              type="number"
              step="0.01"
              min="0"
              value={revenue.accessorials.other || ""}
              onChange={(e) =>
                updateAccessorial("other", parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
