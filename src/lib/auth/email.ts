/**
 * Checks an email address typed into the sign-in form.
 *
 * Deliberately simple: the only real proof an address works is that the
 * sign-in link arrives. This just catches typos and junk before we ask
 * Supabase to send anything.
 */
export type EmailCheck = { ok: true; email: string } | { ok: false; message: string };

export function checkEmail(input: unknown): EmailCheck {
  if (typeof input !== "string" || input.trim() === "") {
    return { ok: false, message: "Enter your email address." };
  }
  const email = input.trim().toLowerCase();
  // 254 characters is the longest address email standards allow.
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "That doesn't look like an email address. Check it and try again." };
  }
  return { ok: true, email };
}
