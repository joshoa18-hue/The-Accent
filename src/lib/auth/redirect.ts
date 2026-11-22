import { routes } from "@/lib/routes";

/**
 * Where to send someone after they sign in.
 *
 * The value comes from the URL (?next=…) or a cookie, which an attacker can
 * control. Without this check, a link like
 *   https://our-site/login?next=https://evil.example
 * would bounce a freshly signed-in user to another website (an "open
 * redirect"), which makes phishing far more convincing.
 *
 * Only plain paths on THIS site are allowed, e.g. "/character".
 */
/**
 * Where the sign-in email should bring people back to: `<origin>/auth/confirm`.
 *
 * `origin` comes from the request's Origin header (the site the form was
 * submitted from). Only a clean http(s) origin is accepted; anything else
 * returns undefined, and Supabase then falls back to the project's Site URL.
 * Supabase also checks the result against its Redirect URLs allow-list, so a
 * forged header can't send a sign-in link to another website.
 */
export function signInCallbackUrl(origin: string | null | undefined): string | undefined {
  if (!origin) return undefined;
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    if (url.origin !== origin) return undefined; // no paths, queries or credentials
    return `${url.origin}${routes.authConfirm()}`;
  } catch {
    return undefined;
  }
}

export function safeNextPath(value: unknown, fallback: string = routes.dashboard()): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 512) return fallback;
  // Must be a path on this site: one leading slash, not "//host" or "/\host".
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  // No control characters or backslashes anywhere (browsers treat "\" like "/").
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return fallback;
  // Resolve it against a dummy origin: it must stay on that origin.
  try {
    const url = new URL(value, "https://the-ascent.invalid");
    if (url.origin !== "https://the-ascent.invalid") return fallback;
    // Never send people back to the sign-in flow itself.
    if (url.pathname.startsWith("/login") || url.pathname.startsWith("/auth/")) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
