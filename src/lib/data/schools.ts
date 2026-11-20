/**
 * DATA LAYER: SCHOOLS (the catalogue)
 * -----------------------------------
 * Pages and components get school data ONLY through these functions. The
 * curriculum is real content kept in code (src/content/catalogue/), so these
 * work for signed-out visitors too and every school page can be prebuilt.
 * They stay `async` so the source could move later without touching pages.
 */
import { catalogueSchools } from "@/content/catalogue/schools";
import type { DataResult } from "@/types/data";
import type { Course, School, SchoolSlug } from "@/types/school";

export async function getSchools(): Promise<DataResult<School[]>> {
  return { data: catalogueSchools, source: "catalogue" };
}

/** Returns `data: null` when no school has this slug (the page then shows a 404). */
export async function getSchoolBySlug(slug: string): Promise<DataResult<School | null>> {
  const school = catalogueSchools.find((s) => s.slug === slug) ?? null;
  return { data: school, source: "catalogue" };
}

/** Every school slug — used to pre-build each school page at build time. */
export async function getSchoolSlugs(): Promise<SchoolSlug[]> {
  return catalogueSchools.map((school) => school.slug);
}

/** Find a course and the school it belongs to. */
export async function getCourseById(
  courseId: string,
): Promise<DataResult<{ school: School; course: Course } | null>> {
  for (const school of catalogueSchools) {
    for (const category of school.categories) {
      const course = category.courses.find((c) => c.id === courseId);
      if (course) return { data: { school, course }, source: "catalogue" };
    }
  }
  return { data: null, source: "catalogue" };
}
