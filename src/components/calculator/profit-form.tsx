"use client";

import { useState } from "react";
import {
  INITIAL_PROFIT_FORM,
  type ProfitFormState,
  type ProfitInput,
} from "@/types/profit";
import type { CostProfile } from "@/types/cost-profile";
import { profitCalculatorSchema } from "@/lib/validation/profit-calculator-schema";

interface ProfitFormProps {
  profiles: CostProfile[];
  onCalculate: (input: ProfitInput, profile: CostProfile) => void;
  error: string | null;
}

const ACCESSORIAL_FIELDS: {
  key: keyof ProfitFormState;
  label: string;
}[] = [
  { key: "accessorialDetention", label: "Detention" },
  { key: "accessorialLayover", label: "Layover" },
  { key: "accessorialTonu", label: "TONU" },
  { key: "accessorialStopPay", label: "Stop pay" },
  { key: "accessorialTarp", label: "Tarp pay" },
  { key: "accessorialLumper", label: "Lumper reimb." },
];

export function ProfitForm({ profiles, onCalculate, error }: ProfitFormProps) {
  const defaultProfile = profiles.find((p) => p.isDefault) ?? profiles[0];

  const [form, setForm] = useState<ProfitFormState>({
    ...INITIAL_PROFIT_FORM,
    costProfileId: defaultProfile?.id ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [accessorialOpen, setAccessorialOpen] = useState(false);
  const [overridesOpen, setOverridesOpen] = useState(false);

  function set<K extends keyof ProfitFormState>(key: K, value: ProfitFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const numKey = (k: keyof ProfitFormState): number => {
      const v = form[k] as string;
      return v === "" ? 0 : Number(v);
    };
    const numKeyOrNull = (k: keyof ProfitFormState): number | null => {
      const v = form[k] as string;
      return v === "" ? null : Number(v);
    };

    const parsed = {
      loadName: form.loadName,
      costProfileId: form.costProfileId,
      origin: form.origin,
      destination: form.destination,
      loadedMiles: numKey("loadedMiles"),
      deadheadMiles: numKey("deadheadMiles"),
      tripHours: numKey("tripHours"),
      linehaulRate: numKey("linehaulRate"),
      fuelSurcharge: numKey("fuelSurcharge"),
      accessorialDetention: numKey("accessorialDetention"),
      accessorialLayover: numKey("accessorialLayover"),
      accessorialTonu: numKey("accessorialTonu"),
      accessorialStopPay: numKey("accessorialStopPay"),
      accessorialTarp: numKey("accessorialTarp"),
      accessorialLumper: numKey("accessorialLumper"),
      tolls: numKey("tolls"),
      fuelPriceOverride: numKeyOrNull("fuelPriceOverride"),
      factoringFeePctOverride: numKeyOrNull("factoringFeePctOverride"),
    };

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

    const profile = profiles.find((p) => p.id === result.data.costProfileId);
    if (!profile) {
      setFieldErrors({ costProfileId: "Selected cost profile not found" });
      return;
    }

    setFieldErrors({});
    onCalculate(result.data as ProfitInput, profile);
  }

  if (profiles.length === 0) {
    return (
      <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
        <p className="text-sm font-semibold text-yellow-900">
          You need a cost profile first.
        </p>
        <p className="text-sm text-yellow-800 mt-1">
          Set up your fixed costs, fuel, and driver pay before running a calculation.
        </p>
        <a
          href="/settings/cost-profile"
          className="inline-block mt-3 rounded-md bg-yellow-600 text-white px-3 py-1.5 text-sm font-semibold hover:bg-yellow-700"
        >
          Set up cost profile →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identity + profile */}
      <div className="space-y-3">
        <Field
          label="Load name"
          id="loadName"
          value={form.loadName}
          onChange={(v) => set("loadName", v)}
          placeholder="e.g. Green Bay → Chicago"
          error={fieldErrors.loadName}
        />
        <div>
          <label htmlFor="costProfileId" className="block text-sm font-medium text-gray-700 mb-1">
            Cost profile
          </label>
          <select
            id="costProfileId"
            value={form.costProfileId}
            onChange={(e) => set("costProfileId", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.isDefault ? " (default)" : ""}
              </option>
            ))}
          </select>
          {fieldErrors.costProfileId && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.costProfileId}</p>
          )}
        </div>
      </div>

      {/* Lane */}
      <Section title="Lane">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Origin"
            id="origin"
            value={form.origin}
            onChange={(v) => set("origin", v)}
            placeholder="Green Bay, WI"
          />
          <Field
            label="Destination"
            id="destination"
            value={form.destination}
            onChange={(v) => set("destination", v)}
            placeholder="Chicago, IL"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field
            label="Loaded miles"
            id="loadedMiles"
            value={form.loadedMiles}
            onChange={(v) => set("loadedMiles", v)}
            placeholder="200"
            numeric
            error={fieldErrors.loadedMiles}
          />
          <Field
            label="Deadhead miles"
            id="deadheadMiles"
            value={form.deadheadMiles}
            onChange={(v) => set("deadheadMiles", v)}
            placeholder="40"
            numeric
            error={fieldErrors.deadheadMiles}
          />
          <Field
            label="Trip hours"
            id="tripHours"
            value={form.tripHours}
            onChange={(v) => set("tripHours", v)}
            placeholder="6"
            numeric
            error={fieldErrors.tripHours}
          />
        </div>
      </Section>

      {/* Revenue */}
      <Section title="Revenue">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Linehaul rate ($)"
            id="linehaulRate"
            value={form.linehaulRate}
            onChange={(v) => set("linehaulRate", v)}
            placeholder="800"
            numeric
            error={fieldErrors.linehaulRate}
          />
          <Field
            label="Fuel surcharge ($)"
            id="fuelSurcharge"
            value={form.fuelSurcharge}
            onChange={(v) => set("fuelSurcharge", v)}
            placeholder="50"
            numeric
            error={fieldErrors.fuelSurcharge}
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setAccessorialOpen((v) => !v)}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {accessorialOpen ? "− Hide" : "+ Add"} accessorials
          </button>
          {accessorialOpen && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {ACCESSORIAL_FIELDS.map((f) => (
                <Field
                  key={f.key}
                  label={`${f.label} ($)`}
                  id={f.key}
                  value={form[f.key] as string}
                  onChange={(v) => set(f.key, v)}
                  placeholder="0"
                  numeric
                />
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Direct trip costs */}
      <Section title="Direct trip costs">
        <Field
          label="Tolls ($)"
          id="tolls"
          value={form.tolls}
          onChange={(v) => set("tolls", v)}
          placeholder="0"
          numeric
          error={fieldErrors.tolls}
        />

        <div>
          <button
            type="button"
            onClick={() => setOverridesOpen((v) => !v)}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {overridesOpen ? "− Hide" : "+ Override"} fuel price / factoring %
          </button>
          {overridesOpen && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field
                label="Fuel price override ($/gal)"
                id="fuelPriceOverride"
                value={form.fuelPriceOverride}
                onChange={(v) => set("fuelPriceOverride", v)}
                placeholder="leave blank = use profile"
                numeric
              />
              <Field
                label="Factoring fee % override"
                id="factoringFeePctOverride"
                value={form.factoringFeePctOverride}
                onChange={(v) => set("factoringFeePctOverride", v)}
                placeholder="leave blank = use profile"
                numeric
              />
            </div>
          )}
        </div>
      </Section>

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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
  numeric,
  error,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode={numeric ? "decimal" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
