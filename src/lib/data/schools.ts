/**
 * DATA LAYER: SCHOOLS
 * -------------------
 * Pages and components get school data ONLY through these functions.
 * Today they read sample data; in Milestone 2 their insides change to
 * Supabase queries while their names and return types stay the same,
 * so no page has to change.
 *
 * They are `async` already because database calls will be asynchronous.
 */
import { sampleSchools } from "@/content/sample/schools";
import type { DataResult } from "@/types/data";
import type { Course, School, SchoolSlug } from "@/types/school";

export async function getSchools(): Promise<DataResult<School[]>> {
  return { data: sampleSchools, source: "sample" };
}

/** Returns `data: null` when no school has this slug (the page then shows a 404). */
export async function getSchoolBySlug(slug: string): Promise<DataResult<School | null>> {
  const school = sampleSchools.find((s) => s.slug === slug) ?? null;
  return { data: school, source: "sample" };
}

/** Every school slug — used to pre-build each school page at build time. */
export async function getSchoolSlugs(): Promise<SchoolSlug[]> {
  return sampleSchools.map((school) => school.slug);
}

/** Find a course and the school it belongs to. */
export async function getCourseById(
  courseId: string,
): Promise<DataResult<{ school: School; course: Course } | null>> {
  for (const school of sampleSchools) {
    for (const category of school.categories) {
      const course = category.courses.find((c) => c.id === courseId);
      if (course) return { data: { school, course }, source: "sample" };
    }
  }
  return { data: null, source: "sample" };
}
