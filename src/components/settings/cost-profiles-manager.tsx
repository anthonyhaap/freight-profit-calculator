"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  costProfileToFormState,
  DEFAULT_COST_PROFILE_FORM,
  DRIVER_PAY_METHODS,
  type CostProfile,
} from "@/types/cost-profile";
import { CostProfileForm } from "./cost-profile-form";

interface CostProfilesManagerProps {
  initialProfiles: CostProfile[];
}

type Mode =
  | { kind: "list" }
  | { kind: "create" }
  | { kind: "edit"; profile: CostProfile };

export function CostProfilesManager({ initialProfiles }: CostProfilesManagerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(() => {
    // First-time users land directly on the create form so they aren't staring at an empty list.
    return initialProfiles.length === 0 ? { kind: "create" } : { kind: "list" };
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleSaved() {
    setMode({ kind: "list" });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this cost profile? This cannot be undone.")) return;

    setDeletingId(id);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/cost-profiles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete cost profile");
      }
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete cost profile");
    } finally {
      setDeletingId(null);
    }
  }

  if (mode.kind === "create") {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialProfiles.length === 0 ? "Set up your cost profile" : "New cost profile"}
          </h2>
          {initialProfiles.length > 0 && (
            <button
              type="button"
              onClick={() => setMode({ kind: "list" })}
              className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
        <CostProfileForm initial={DEFAULT_COST_PROFILE_FORM} onSaved={handleSaved} />
      </div>
    );
  }

  if (mode.kind === "edit") {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Edit cost profile</h2>
          <button
            type="button"
            onClick={() => setMode({ kind: "list" })}
            className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Cancel
          </button>
        </div>
        <CostProfileForm
          initial={costProfileToFormState(mode.profile)}
          profileId={mode.profile.id}
          onSaved={handleSaved}
        />
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {initialProfiles.length === 1
            ? "1 cost profile"
            : `${initialProfiles.length} cost profiles`}
        </p>
        <button
          type="button"
          onClick={() => setMode({ kind: "create" })}
          className="rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800 cursor-pointer"
        >
          + New profile
        </button>
      </div>

      {deleteError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">{deleteError}</p>
        </div>
      )}

      <div className="space-y-3">
        {initialProfiles.map((p) => (
          <ProfileRow
            key={p.id}
            profile={p}
            onEdit={() => setMode({ kind: "edit", profile: p })}
            onDelete={() => handleDelete(p.id)}
            deleting={deletingId === p.id}
          />
        ))}
      </div>
    </div>
  );
}

function ProfileRow({
  profile,
  onEdit,
  onDelete,
  deleting,
}: {
  profile: CostProfile;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const methodLabel =
    DRIVER_PAY_METHODS.find((m) => m.value === profile.driverPayMethod)?.label ??
    profile.driverPayMethod;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">{profile.name}</h3>
            {profile.isDefault && (
              <span className="text-xs uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Default
              </span>
            )}
          </div>
          <dl className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <Stat label="Fixed/day" value={`$${profile.fixedCostPerDay.toFixed(2)}`} />
            <Stat label="Var/mile" value={`$${profile.variableCostPerMile.toFixed(3)}`} />
            <Stat label="MPG" value={profile.mpg.toFixed(1)} />
            <Stat label="Fuel" value={`$${profile.defaultFuelPrice.toFixed(3)}`} />
            <Stat label="Driver" value={methodLabel} />
            <Stat label="Factoring" value={`${profile.factoringFeePct.toFixed(1)}%`} />
            <Stat label="Target margin" value={`${profile.targetProfitMarginPct.toFixed(1)}%`} />
          </dl>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md border border-gray-300 bg-white text-gray-700 px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="rounded-md border border-red-300 bg-white text-red-700 px-3 py-1.5 text-xs font-semibold hover:bg-red-50 disabled:opacity-50 cursor-pointer"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}
