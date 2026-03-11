"use client";

import { useLocalStorage } from "./use-local-storage";
import type { SavedCalculation } from "@/types";

export function useCalculations() {
  const [calculations, setCalculations, isLoaded] = useLocalStorage<
    SavedCalculation[]
  >("fpc:calculations", []);

  const addCalculation = (calc: SavedCalculation) => {
    setCalculations((prev) => [calc, ...prev]);
  };

  const removeCalculation = (id: string) => {
    setCalculations((prev) => prev.filter((c) => c.id !== id));
  };

  return { calculations, addCalculation, removeCalculation, isLoaded };
}
