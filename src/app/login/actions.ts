"use server";

import { cookies, headers } from "next/headers";
import { checkEmail } from "@/lib/auth/email";
import { RETURN_TO_COOKIE, RETURN_TO_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { safeNextPath, signInCallbackUrl } from "@/lib/auth/redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SignInState =
  | { status: "idle" }
  | { status: "error"; message: string; email: string }
  | { status: "sent"; email: string };

/**
 * SERVER ACTION: email a one-time sign-in link.
 *
 * Runs only on the server. The form posts here; nothing about Supabase is
 * sent to the browser. New addresses get an account automatically, and the
 * reply is the same whether or not an account already existed, so this form
 * can't be used to discover who has signed up.
 */
export async function sendSignInLink(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const typed = String(formData.get("email") ?? "");
  const checked = checkEmail(typed);
  if (!checked.ok) return { status: "error", message: checked.message, email: typed };

  // Remember where to return after the link is clicked (validated again on use).
  const returnTo = safeNextPath(formData.get("next"));
  const cookieStore = await cookies();
  cookieStore.set(RETURN_TO_COOKIE, returnTo, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/auth",
    maxAge: RETURN_TO_MAX_AGE_SECONDS,
  });

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: checked.email,
    options: {
      shouldCreateUser: true,
      // Supabase's default email template links via Supabase back to here.
      emailRedirectTo: signInCallbackUrl((await headers()).get("origin")),
    },
  });

  if (error) {
    // Log the detail for developers; show people something they can act on.
    console.error("[sign-in] signInWithOtp failed:", error.status, error.code, error.message);
    const tooMany = error.status === 429 || error.code === "over_email_send_rate_limit";
    return {
      status: "error",
      email: typed,
      message: tooMany
        ? "Too many sign-in emails were requested. Wait a minute, then try again."
        : "We couldn't send the sign-in link right now. Try again in a moment.",
    };
  }

  return { status: "sent", email: checked.email };
}
