// TEMPORARY debug route — confirms what Supabase env vars actually look like at
// runtime in production. NEVER returns the actual values, only lengths and the
// first 8 chars so we can identify the value without exposing the secret.
//
// REMOVE THIS FILE once production auth is confirmed working.

import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    url: {
      present: typeof url === "string",
      length: url?.length ?? 0,
      first8: url?.substring(0, 8) ?? null,
      // If the value is the expected Supabase URL, this should be true.
      matchesProjectRef: url?.includes("mnsjbgjlvgyrzwnhefzd") ?? false,
    },
    key: {
      present: typeof key === "string",
      length: key?.length ?? 0,
      first8: key?.substring(0, 8) ?? null,
      // Anon JWTs always start with "eyJ".
      looksLikeJwt: key?.startsWith("eyJ") ?? false,
    },
  });
}
