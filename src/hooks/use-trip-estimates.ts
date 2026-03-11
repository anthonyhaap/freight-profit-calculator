"use client";

import { useLocalStorage } from "./use-local-storage";
import type { TripEstimate } from "@/types";

export function useTripEstimates() {
  const [estimates, setEstimates, isLoaded] = useLocalStorage<TripEstimate[]>(
    "fpc:tripEstimates",
    []
  );

  const addEstimate = (estimate: TripEstimate) => {
    setEstimates((prev) => [estimate, ...prev]);
  };

  const removeEstimate = (id: string) => {
    setEstimates((prev) => prev.filter((e) => e.id !== id));
  };

  return { estimates, addEstimate, removeEstimate, isLoaded };
}
