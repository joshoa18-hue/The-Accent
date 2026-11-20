import { NextResponse, type NextRequest } from "next/server";
import { catalogueLessons } from "@/content/catalogue/lessons";
import { catalogueSchools } from "@/content/catalogue/schools";
import { routes } from "@/lib/routes";
import { refreshSession } from "@/lib/supabase/proxy-session";

/**
 * PROXY: runs on the server before every page request (formerly "middleware").
 *
 * 1. Unknown school and lesson addresses get a real HTTP 404.
 * 2. Refreshes the Supabase session cookies.
 * 3. Optimistic redirects: signed-out visitors can't open private pages, and
 *    signed-in learners skip the sign-in page.
 *
 * It only reads cookies; it never queries learner data. Every private page
 * still checks the user itself (requireUser), and the database enforces RLS.
 */

const knownSchoolSlugs = new Set<string>(catalogueSchools.map((school) => school.slug));
const knownLessonIds = new Set<string>(catalogueLessons.map((lesson) => lesson.id));

/** Catalogue pages whose last URL segment must be a known id: unknown ones get a real 404. */
const catalogueRoutes: { pattern: RegExp; known: Set<string> }[] = [
  { pattern: /^\/schools\/([^/]+)\/?$/, known: knownSchoolSlugs },
  { pattern: /^\/lessons\/([^/]+)\/?$/, known: knownLessonIds },
];

function isUnknownCataloguePage(pathname: string): boolean {
  for (const { pattern, known } of catalogueRoutes) {
    const match = pattern.exec(pathname);
    if (match) {
      try {
        return !known.has(decodeURIComponent(match[1]));
      } catch {
        return true; // malformed %-encoding is never a real id
      }
    }
  }
  return false;
}

/** Pages that need a signed-in learner. Everything else is public. */
const privatePaths = new Set([routes.dashboard(), routes.character()]);

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. /schools/<slug> or /lessons/<id> that doesn't exist → a genuine 404.
  if (isUnknownCataloguePage(pathname)) {
    // Rewriting to a path no route handles renders the not-found page with status 404.
    return NextResponse.rewrite(new URL("/_unknown-page", request.url));
  }

  // 2. Keep the session fresh. If Supabase can't be reached, carry on as
  //    "signed out" so public pages (like the schools) still work.
  let session: Awaited<ReturnType<typeof refreshSession>>;
  try {
    session = await refreshSession(request);
  } catch (error) {
    console.error("[proxy] session refresh failed:", error instanceof Error ? error.message : error);
    session = {
      response: NextResponse.next({ request }),
      isSignedIn: false,
      withSessionCookies: (target: NextResponse) => target,
    };
  }
  const { response, isSignedIn, withSessionCookies } = session;

  // 3a. Private page while signed out → sign in, then come back here.
  if (!isSignedIn && privatePaths.has(pathname)) {
    return withSessionCookies(NextResponse.redirect(new URL(routes.login(pathname + search), request.url)));
  }

  // 3b. Already signed in → no need to see the sign-in page.
  if (isSignedIn && pathname === "/login") {
    return withSessionCookies(NextResponse.redirect(new URL(routes.dashboard(), request.url)));
  }

  return response;
}

export const config = {
  matcher: [
    // Every path except Next.js internals and static files (icons, manifest, images).
    "/((?!_next/static|_next/image|icons/|icon.svg|apple-icon|manifest.webmanifest|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt)$).*)",
  ],
};
