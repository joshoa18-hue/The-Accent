/**
 * Options for the Supabase session cookies.
 *
 * Supabase's defaults let page JavaScript read the session cookie, because
 * some apps use a Supabase client IN THE BROWSER. The Ascent never does (all
 * Supabase calls happen on the server), so we can lock the cookie down:
 *
 *  - httpOnly: JavaScript on the page can't read the login token, so even an
 *    injected script couldn't steal it;
 *  - secure: in production, only sent over HTTPS (browsers still allow it on
 *    http://localhost for local testing);
 *  - sameSite "lax": not sent with cross-site form posts, which blocks most
 *    cross-site request forgery.
 */
export const sessionCookieOptions = {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
} as const;
