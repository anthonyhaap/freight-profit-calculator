"use client";

import { useState } from "react";
import {
  DEFAULT_COST_PROFILE_FORM,
  DRIVER_PAY_METHODS,
  type CostProfileFormState,
  type CostProfileSavePayload,
  type DriverPayMethod,
} from "@/types/cost-profile";
import { costProfileSchema } from "@/lib/validation/cost-profile-schema";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface CostProfileFormProps {
  initial?: CostProfileFormState;
  profileId?: string; // present when editing an existing profile
  onSaved?: () => void;
}

const NUMERIC_KEYS: (keyof CostProfileFormState)[] = [
  "fixedCostPerDay",
  "variableCostPerMile",
  "mpg",
  "defaultFuelPrice",
  "driverPayPerMile",
  "driverPayPercentage",
  "driverPayHourly",
  "driverPaySalaryPerWeek",
  "driverPayOwnerDrawPerWeek",
  "standardWeekHours",
  "factoringFeePct",
  "targetProfitMarginPct",
];

export function CostProfileForm({ initial, profileId, onSaved }: CostProfileFormProps) {
  const [form, setForm] = useState<CostProfileFormState>(
    initial ?? DEFAULT_COST_PROFILE_FORM
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  function set<K extends keyof CostProfileFormState>(key: K, value: CostProfileFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key as string];
      delete next.driverPayMethod; // refine() error attaches here
      return next;
    });
    setSaveStatus("idle");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Convert numeric strings to numbers for Zod validation.
    const parsedNumeric: Record<string, unknown> = {
      name: form.name,
      isDefault: form.isDefault,
      driverPayMethod: form.driverPayMethod,
    };
    for (const key of NUMERIC_KEYS) {
      const v = form[key];
      parsedNumeric[key] = v === "" ? undefined : Number(v);
    }

    const result = costProfileSchema.safeParse(parsedNumeric);

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
    setSaveStatus("saving");
    setSaveError(null);

    const payload: CostProfileSavePayload = {
      name: result.data.name,
      is_default: result.data.isDefault,
      fixed_cost_per_day: result.data.fixedCostPerDay,
      variable_cost_per_mile: result.data.variableCostPerMile,
      mpg: result.data.mpg,
      default_fuel_price: result.data.defaultFuelPrice,
      driver_pay_method: result.data.driverPayMethod,
      driver_pay_per_mile: result.data.driverPayPerMile,
      driver_pay_percentage: result.data.driverPayPercentage,
      driver_pay_hourly: result.data.driverPayHourly,
      driver_pay_salary_per_week: result.data.driverPaySalaryPerWeek,
      driver_pay_owner_draw_per_week: result.data.driverPayOwnerDrawPerWeek,
      standard_week_hours: result.data.standardWeekHours,
      factoring_fee_pct: result.data.factoringFeePct,
      target_profit_margin_pct: result.data.targetProfitMarginPct,
    };

    try {
      const url = profileId ? `/api/cost-profiles/${profileId}` : "/api/cost-profiles";
      const method = profileId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save cost profile");
      }

      setSaveStatus("saved");
      onSaved?.();
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "Failed to save cost profile");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profile identity */}
      <Section title="Profile" subtitle="Name this profile so you can pick it later — e.g. 'Default' or 'Truck 101'.">
        <Field
          label="Profile name"
          id="name"
          value={form.name}
          onChange={(v) => set("name", v)}
          placeholder="Default"
          error={fieldErrors.name}
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => set("isDefault", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Use as my default profile
        </label>
      </Section>

      {/* Fixed and variable costs */}
      <Section
        title="Fixed and variable costs"
        subtitle="Fixed costs exist whether the truck moves or sits. Variable costs grow with miles."
      >
        <Field
          label="Fixed cost per day ($)"
          id="fixedCostPerDay"
          value={form.fixedCostPerDay}
          onChange={(v) => set("fixedCostPerDay", v)}
          placeholder="200"
          numeric
          error={fieldErrors.fixedCostPerDay}
          helper="Truck pmt + trailer pmt + insurance + plates + ELD + admin, divided by days you operate."
        />
        <Field
          label="Variable cost per mile ($)"
          id="variableCostPerMile"
          value={form.variableCostPerMile}
          onChange={(v) => set("variableCostPerMile", v)}
          placeholder="0.15"
          numeric
          error={fieldErrors.variableCostPerMile}
          helper="Maintenance + tires + other per-mile items (not fuel, not driver pay)."
        />
      </Section>

      {/* Fuel */}
      <Section title="Fuel" subtitle="Your truck's MPG and a default fuel price. You can override the price per load.">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="MPG"
            id="mpg"
            value={form.mpg}
            onChange={(v) => set("mpg", v)}
            placeholder="6.5"
            numeric
            error={fieldErrors.mpg}
          />
          <Field
            label="Default fuel price ($/gal)"
            id="defaultFuelPrice"
            value={form.defaultFuelPrice}
            onChange={(v) => set("defaultFuelPrice", v)}
            placeholder="3.89"
            numeric
            error={fieldErrors.defaultFuelPrice}
          />
        </div>
      </Section>

      {/* Driver pay */}
      <Section
        title="Driver pay"
        subtitle="Pick how the driver is paid. We'll only ask for the field that matches the method you choose."
      >
        <div>
          <label htmlFor="driverPayMethod" className="block text-sm font-medium text-gray-700 mb-1">
            Method
          </label>
          <select
            id="driverPayMethod"
            value={form.driverPayMethod}
            onChange={(e) => set("driverPayMethod", e.target.value as DriverPayMethod)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {DRIVER_PAY_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {DRIVER_PAY_METHODS.find((m) => m.value === form.driverPayMethod)?.helper}
          </p>
          {fieldErrors.driverPayMethod && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.driverPayMethod}</p>
          )}
        </div>

        {form.driverPayMethod === "per_mile" && (
          <Field
            label="Driver pay ($/mile)"
            id="driverPayPerMile"
            value={form.driverPayPerMile}
            onChange={(v) => set("driverPayPerMile", v)}
            placeholder="0.55"
            numeric
            error={fieldErrors.driverPayPerMile}
          />
        )}
        {form.driverPayMethod === "percentage" && (
          <Field
            label="Driver pay (% of linehaul)"
            id="driverPayPercentage"
            value={form.driverPayPercentage}
            onChange={(v) => set("driverPayPercentage", v)}
            placeholder="25"
            numeric
            error={fieldErrors.driverPayPercentage}
          />
        )}
        {form.driverPayMethod === "hourly" && (
          <Field
            label="Driver pay ($/hour)"
            id="driverPayHourly"
            value={form.driverPayHourly}
            onChange={(v) => set("driverPayHourly", v)}
            placeholder="28"
            numeric
            error={fieldErrors.driverPayHourly}
          />
        )}
        {(form.driverPayMethod === "salary" || form.driverPayMethod === "owner_draw") && (
          <div className="grid grid-cols-2 gap-4">
            {form.driverPayMethod === "salary" ? (
              <Field
                label="Salary ($/week)"
                id="driverPaySalaryPerWeek"
                value={form.driverPaySalaryPerWeek}
                onChange={(v) => set("driverPaySalaryPerWeek", v)}
                placeholder="1500"
                numeric
                error={fieldErrors.driverPaySalaryPerWeek}
              />
            ) : (
              <Field
                label="Owner draw ($/week)"
                id="driverPayOwnerDrawPerWeek"
                value={form.driverPayOwnerDrawPerWeek}
                onChange={(v) => set("driverPayOwnerDrawPerWeek", v)}
                placeholder="1500"
                numeric
                error={fieldErrors.driverPayOwnerDrawPerWeek}
              />
            )}
            <Field
              label="Standard week (hours)"
              id="standardWeekHours"
              value={form.standardWeekHours}
              onChange={(v) => set("standardWeekHours", v)}
              placeholder="60"
              numeric
              error={fieldErrors.standardWeekHours}
              helper="Used to prorate weekly pay to a single load by trip hours / standard week hours."
            />
          </div>
        )}
      </Section>

      {/* Factoring + targets */}
      <Section title="Factoring and targets" subtitle="Defaults applied to every calculation (override per-load if needed).">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Factoring / quick pay fee (%)"
            id="factoringFeePct"
            value={form.factoringFeePct}
            onChange={(v) => set("factoringFeePct", v)}
            placeholder="3"
            numeric
            error={fieldErrors.factoringFeePct}
            helper="Set to 0 if you don't factor."
          />
          <Field
            label="Target profit margin (%)"
            id="targetProfitMarginPct"
            value={form.targetProfitMarginPct}
            onChange={(v) => set("targetProfitMarginPct", v)}
            placeholder="15"
            numeric
            error={fieldErrors.targetProfitMarginPct}
            helper="Drives the recommended target rate."
          />
        </div>
      </Section>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={saveStatus === "saving"}
          className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 cursor-pointer ${
            saveStatus === "saved"
              ? "bg-green-600 text-white"
              : saveStatus === "saving"
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500"
          }`}
        >
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "saved"
            ? "Saved"
            : profileId
            ? "Save changes"
            : "Create profile"}
        </button>
        {saveError && <p className="mt-2 text-sm text-red-600">{saveError}</p>}
      </div>
    </form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="space-y-4">{children}</div>
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
  helper,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
  error?: string;
  helper?: string;
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
      {helper && !error && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
