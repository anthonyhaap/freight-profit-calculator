import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side auth gate for protected pages.
 * Returns the authenticated user, or redirects to /login.
 * Call this at the top of every protected page.
 */
export async function requireUser(currentPath?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const search = currentPath
      ? `?next=${encodeURIComponent(currentPath)}`
      : "";
    redirect(`/login${search}`);
  }

  return { supabase, user };
}
