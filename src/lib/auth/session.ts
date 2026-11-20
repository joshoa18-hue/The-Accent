import "server-only";
import { cacheLife } from "next/cache";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * DATA ACCESS LAYER: who is signed in?
 *
 * The one place the app asks "who is this?". Pages, Server Actions and the
 * data layer call these functions instead of reading cookies themselves, so
 * the rule lives in one spot.
 *
 * Reading the session reads cookies, which only exist at request time, so any
 * component that calls these must sit inside a <Suspense> boundary.
 */
export type SessionUser = {
  id: string;
  email: string | null;
};

/**
 * The signed-in user, or null.
 *
 * getClaims() verifies the token's signature, so a forged cookie is rejected.
 * (Never trust getSession() on the server: it doesn't verify the token.)
 *
 * `"use cache: private"`: checking a token compares its expiry with the
 * current time, which Next.js can't prerender. A PRIVATE cache runs at request
 * time with this visitor's cookies, lets repeated calls in one request share
 * the answer, and is never stored in a server cache shared between visitors.
 * Cookies can't be written in here; the Proxy already refreshes them.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  "use cache: private";
  cacheLife({ stale: 30 });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : null };
}

/**
 * For private pages: returns the user, or sends them to sign in.
 * `returnTo` is where to bring them back afterwards.
 */
export async function requireUser(returnTo: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(routes.login(returnTo));
  return user;
}
