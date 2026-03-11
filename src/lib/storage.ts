import type { SavedCalculation, OperatingProfile, TripEstimate } from "@/types";
import { DEFAULT_OPERATING_PROFILE } from "./constants";

const KEYS = {
  calculations: "fpc:calculations",
  tripEstimates: "fpc:tripEstimates",
  operatingProfile: "fpc:operatingProfile",
} as const;

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

// Calculations
export function getCalculations(): SavedCalculation[] {
  return safeGet<SavedCalculation[]>(KEYS.calculations, []);
}

export function saveCalculation(calc: SavedCalculation): void {
  const existing = getCalculations();
  existing.unshift(calc);
  safeSet(KEYS.calculations, existing);
}

export function deleteCalculation(id: string): void {
  const existing = getCalculations().filter((c) => c.id !== id);
  safeSet(KEYS.calculations, existing);
}

// Operating Profile
export function getOperatingProfile(): OperatingProfile {
  return safeGet<OperatingProfile>(
    KEYS.operatingProfile,
    DEFAULT_OPERATING_PROFILE
  );
}

export function saveOperatingProfile(profile: OperatingProfile): void {
  safeSet(KEYS.operatingProfile, profile);
}

// Trip Estimates
export function getTripEstimates(): TripEstimate[] {
  return safeGet<TripEstimate[]>(KEYS.tripEstimates, []);
}

export function saveTripEstimate(estimate: TripEstimate): void {
  const existing = getTripEstimates();
  existing.unshift(estimate);
  safeSet(KEYS.tripEstimates, existing);
}

export function deleteTripEstimate(id: string): void {
  const existing = getTripEstimates().filter((e) => e.id !== id);
  safeSet(KEYS.tripEstimates, existing);
}
