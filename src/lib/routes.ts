/**
 * Every internal URL is built here, in one place. If a route ever changes,
 * we change it once instead of hunting through every component.
 */
export const routes = {
  dashboard: () => "/",
  schools: () => "/schools",
  school: (slug: string) => `/schools/${slug}`,
  /** Links to a course on its school page; the #fragment scrolls to it and opens it. */
  course: (schoolSlug: string, courseId: string) => `/schools/${schoolSlug}#${courseAnchorId(courseId)}`,
  character: () => "/character",
  /** The sign-in page. `next` is where to go afterwards (checked by safeNextPath). */
  login: (next?: string) => (next && next !== "/" ? `/login?next=${encodeURIComponent(next)}` : "/login"),
  /** Where the link in the sign-in email lands (see supabase/templates/). */
  authConfirm: () => "/auth/confirm",
};

/** The HTML id given to a course on its school page. */
export function courseAnchorId(courseId: string): string {
  return `course-${courseId}`;
}
