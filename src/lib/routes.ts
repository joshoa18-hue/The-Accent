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
};

/** The HTML id given to a course on its school page. */
export function courseAnchorId(courseId: string): string {
  return `course-${courseId}`;
}
