"use client";

import { useLocalStorage } from "./use-local-storage";
import { DEFAULT_OPERATING_PROFILE } from "@/lib/constants";
import type { OperatingProfile } from "@/types";

export function useOperatingProfile() {
  const [profile, setProfile, isLoaded] = useLocalStorage<OperatingProfile>(
    "fpc:operatingProfile",
    DEFAULT_OPERATING_PROFILE
  );

  return { profile, setProfile, isLoaded };
}
