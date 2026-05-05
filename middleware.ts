import { NextResponse } from "next/server";

// Auth gating happens at the page level via requireUser() — this middleware
// is intentionally a no-op with an empty matcher so Next.js never invokes it.
// We keep the file because it was previously committed; an empty matcher is
// the cleanest way to fully disable middleware without needing to delete the
// file (which is awkward across Windows / Linux mounts in this dev setup).
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
