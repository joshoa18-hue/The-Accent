import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { readSupabaseEnv } from "./env";

/**
 * Runs inside the Proxy on every page request.
 *
 * Supabase sessions are short-lived access tokens plus a refresh token, both
 * stored in cookies. When the access token is about to expire, this swaps it
 * for a new one and writes the new cookies onto BOTH the request (so the page
 * being rendered sees them) and the response (so the browser keeps them).
 *
 * Returns the response to continue with and whether a valid session exists.
 * This is an OPTIMISTIC check for redirects only. Real authorization happens
 * again next to the data (src/lib/auth/session.ts and Row Level Security).
 */
export async function refreshSession(request: NextRequest) {
  const { url, publishableKey } = readSupabaseEnv();
  let response = NextResponse.next({ request });
  let cacheHeaders: Record<string, string> = {};

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        // e.g. Cache-Control: private, no-store — never cache a response that sets auth cookies.
        cacheHeaders = { ...cacheHeaders, ...headers };
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  // getClaims() verifies the access token (refreshing it if needed).
  // Don't run other code between creating the client and this call.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);

  /** Copy refreshed cookies onto a redirect, so a refresh isn't lost. */
  function withSessionCookies(target: NextResponse): NextResponse {
    for (const cookie of response.cookies.getAll()) target.cookies.set(cookie);
    for (const [key, value] of Object.entries(cacheHeaders)) target.headers.set(key, value);
    return target;
  }

  return { response, isSignedIn, withSessionCookies };
}
