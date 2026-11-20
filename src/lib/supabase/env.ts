/**
 * Reads the Supabase connection settings from environment variables.
 *
 * These are deliberately NOT prefixed with NEXT_PUBLIC_, so Next.js never
 * copies them into JavaScript sent to the browser. All Supabase calls in The
 * Ascent happen on the server (Server Components, Server Actions, Route
 * Handlers and the Proxy).
 *
 * Only the PUBLISHABLE key is used. It is safe on its own because Row Level
 * Security decides what each request may see. A secret / service-role key is
 * refused, so it can't be used by mistake.
 */
export type SupabaseEnv = { url: string; publishableKey: string };

/** Legacy keys are JWTs; their payload says which role they grant. */
function legacyKeyRole(key: string): string | null {
  const payload = key.split(".")[1];
  if (!payload) return null;
  try {
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { role?: unknown };
    return typeof json.role === "string" ? json.role : null;
  } catch {
    return null;
  }
}

export function isPublishableKey(key: string): boolean {
  if (key.startsWith("sb_publishable_")) return true;
  if (key.startsWith("eyJ")) return legacyKeyRole(key) === "anon";
  return false;
}

export function readSupabaseEnv(env: Record<string, string | undefined> = process.env): SupabaseEnv {
  const url = env.SUPABASE_URL;
  const publishableKey = env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.local " +
        "and fill them in (for the local stack: `npm run db:status`).",
    );
  }
  if (!/^https?:\/\//.test(url)) {
    throw new Error("SUPABASE_URL must start with http:// or https://");
  }
  if (!isPublishableKey(publishableKey)) {
    throw new Error(
      "SUPABASE_PUBLISHABLE_KEY must be a publishable (or legacy anon) key, never a secret or service-role key.",
    );
  }
  return { url, publishableKey };
}
