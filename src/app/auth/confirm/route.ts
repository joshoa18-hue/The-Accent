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
 * ROUTE HANDLER: the link in the sign-in email lands here, in one of two forms.
 *
 * 1. Our own email template (used locally, see supabase/templates/):
 *      /auth/confirm?token_hash=…&type=email
 *    The one-time token is verified directly.
 *
 * 2. Supabase's DEFAULT template (hosted projects can only change templates
 *    after setting up custom email/SMTP). Its link goes to Supabase first,
 *    which then sends the browser here with a one-time code:
 *      /auth/confirm?code=…(&sb_flow_id=…)
 *    The code is exchanged for a session using the secret "code verifier"
 *    cookie the server stored when the email was requested (PKCE), so a code
 *    is useless in any other browser.
 *
 * Either way the session is stored in cookies, and the learner goes back to
 * where they were. Links work once: a second click shows a friendly error.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const code = params.get("code");
  const flowId = params.get("sb_flow_id");

  const cookieStore = await cookies();
  const returnTo = safeNextPath(cookieStore.get(RETURN_TO_COOKIE)?.value);
  cookieStore.delete({ name: RETURN_TO_COOKIE, path: "/auth" });

  // Supabase reports an expired or already-used link with ?error=… instead of a code.
  if (params.has("error")) {
    console.error("[auth/confirm] link rejected by Supabase:", params.get("error_code") ?? params.get("error"));
  } else if (tokenHash && type && allowedTypes.has(type)) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(new URL(returnTo, request.url));
    console.error("[auth/confirm] verifyOtp failed:", error.status, error.code);
  } else if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
    if (!error) return NextResponse.redirect(new URL(returnTo, request.url));
    console.error("[auth/confirm] exchangeCodeForSession failed:", error.status, error.code);
  }

  return NextResponse.redirect(new URL(`${routes.login()}?error=link`, request.url));
}
