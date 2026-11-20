import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
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
