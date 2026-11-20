import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { RETURN_TO_COOKIE } from "@/lib/auth/constants";
import { safeNextPath } from "@/lib/auth/redirect";
import { routes } from "@/lib/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** The only link types our emails send. */
const allowedTypes = new Set<EmailOtpType>(["email", "magiclink", "signup"]);

/**
 * ROUTE HANDLER: the link in the sign-in email lands here.
 *
 *   /auth/confirm?token_hash=…&type=email
 *
 * The one-time token is exchanged for a session (stored in cookies by the
 * server client). Then the learner is sent back to where they were going.
 * The token works once: clicking the link twice shows a friendly error.
 */
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;

  const cookieStore = await cookies();
  const returnTo = safeNextPath(cookieStore.get(RETURN_TO_COOKIE)?.value);
  cookieStore.delete({ name: RETURN_TO_COOKIE, path: "/auth" });

  if (tokenHash && type && allowedTypes.has(type)) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      return NextResponse.redirect(new URL(returnTo, request.url));
    }
    console.error("[auth/confirm] verifyOtp failed:", error.status, error.code);
  }

  return NextResponse.redirect(new URL(`${routes.login()}?error=link`, request.url));
}
