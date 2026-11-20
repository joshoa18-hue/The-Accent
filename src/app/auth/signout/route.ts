import { NextResponse, type NextRequest } from "next/server";
import { routes } from "@/lib/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * ROUTE HANDLER: sign out (POST only).
 *
 * Why a Route Handler and not a Server Action: a Server Action's redirect is a
 * "soft" navigation, so the app keeps running in the tab, including hidden
 * copies of recently visited pages with the previous learner's name and
 * email. Testing found exactly that. A plain form POST answered with a 303
 * redirect makes the browser load /login from scratch, which throws all of
 * that away. `Clear-Site-Data: "cache"` also drops any cached pages.
 */
export async function POST(request: NextRequest) {
  // Only accept sign-out from our own pages: another website can't trigger it.
  const origin = request.headers.get("origin");
  if (origin !== null && origin !== request.nextUrl.origin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  // 303 See Other: "the result is at /login; fetch it with GET".
  const response = NextResponse.redirect(new URL(routes.login(), request.url), 303);
  response.headers.set("Clear-Site-Data", '"cache"');
  response.headers.set("Cache-Control", "no-store");
  return response;
}
