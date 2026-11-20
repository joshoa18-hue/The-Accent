import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cacheLife } from "next/cache";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { sessionCookieOptions } from "./cookies";
import { readSupabaseEnv } from "./env";

/**
 * A Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * It reads the signed-in user's session from cookies, so every query runs AS
 * that user and Row Level Security applies. Create a new one per request:
 * never share a client between users.
 *
 * `server-only` makes the build fail if this file is ever imported into code
 * that runs in the browser.
 */
export async function createSupabaseServerClient() {
  const { url, publishableKey } = readSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookieOptions: sessionCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components can't set cookies. That's fine: the Proxy
          // (src/proxy.ts) refreshes the session cookies on every request.
        }
      },
    },
  });
}

/**
 * The signed-in learner's access token (a signed JWT), or null.
 *
 * Read once per request in a PRIVATE cache: it needs cookies and the clock,
 * and must never be shared between visitors. It's only used to forward to the
 * database, which verifies the signature on every query, so reading it with
 * getSession() here is safe. Decisions about WHO someone is still use
 * getClaims() (src/lib/auth/session.ts).
 */
async function getAccessToken(): Promise<string | null> {
  "use cache: private";
  cacheLife({ stale: 30 });

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * A client for READING the learner's data in Server Components.
 *
 * It does no session handling of its own: it just sends the learner's access
 * token with each query, and Row Level Security does the rest. Because it
 * holds no shared state, data functions can run in parallel safely.
 * (Use createSupabaseServerClient() for sign-in, sign-out and writes.)
 */
export async function createSupabaseDataClient() {
  const { url, publishableKey } = readSupabaseEnv();
  const token = await getAccessToken();
  return createClient<Database>(url, publishableKey, {
    accessToken: async () => token,
  });
}
