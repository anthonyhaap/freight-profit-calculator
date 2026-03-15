"use client";

import { useState } from "react";
import type { ProfitFormState, ProfitInput } from "@/types/profit";
import { profitCalculatorSchema } from "@/lib/validation/profit-calculator-schema";

const INITIAL_FORM: ProfitFormState = {
  loadName: "",
  revenue: "",
  loadedMiles: "",
  deadheadMiles: "",
  tripHours: "",
  fuelPrice: "",
  mpg: "",
  driverPayPerMile: "",
  hourlyOperatingCost: "",
  maintenancePerMile: "",
};

const FIELDS: { key: keyof ProfitFormState; label: string; placeholder: string }[] = [
  { key: "loadName", label: "Load Name", placeholder: "e.g. Dallas to Chicago" },
  { key: "revenue", label: "Revenue ($)", placeholder: "3500" },
  { key: "loadedMiles", label: "Loaded Miles", placeholder: "1200" },
  { key: "deadheadMiles", label: "Deadhead Miles", placeholder: "150" },
  { key: "tripHours", label: "Trip Hours", placeholder: "20" },
  { key: "fuelPrice", label: "Fuel Price ($/gal)", placeholder: "3.89" },
  { key: "mpg", label: "MPG", placeholder: "6.5" },
  { key: "driverPayPerMile", label: "Driver Pay ($/mile)", placeholder: "0.55" },
  { key: "hourlyOperatingCost", label: "Hourly Operating Cost ($)", placeholder: "25" },
  { key: "maintenancePerMile", label: "Maintenance ($/mile)", placeholder: "0.12" },
];

interface ProfitFormProps {
  onCalculate: (input: ProfitInput) => void;
  error: string | null;
}

export function ProfitForm({ onCalculate, error }: ProfitFormProps) {
  const [form, setForm] = useState<ProfitFormState>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleChange(key: keyof ProfitFormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed: Record<string, unknown> = { loadName: form.loadName };
    for (const field of FIELDS) {
      if (field.key === "loadName") continue;
      parsed[field.key] = form[field.key] === "" ? undefined : Number(form[field.key]);
    }

    const result = profitCalculatorSchema.safeParse(parsed);

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    onCalculate(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {FIELDS.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <input
            id={key}
            type={key === "loadName" ? "text" : "text"}
            inputMode={key === "loadName" ? "text" : "decimal"}
            value={form[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fieldErrors[key] ? "border-red-400" : "border-gray-300"
            }`}
          />
          {fieldErrors[key] && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors[key]}</p>
          )}
        </div>
      ))}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        Calculate
      </button>
    </form>
  );
}
