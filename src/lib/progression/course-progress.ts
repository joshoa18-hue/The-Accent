import type { LearningActivityView } from "@/types/activity";
import type { School, SchoolSlug } from "@/types/school";

/** The minimum we need to know about each written lesson. */
export type ProgressLesson = {
  id: string;
  title: string;
  courseId: string;
  moduleId: string;
  schoolSlug: SchoolSlug;
};

export type ProgressCompletion = { lessonId: string; completedAt: string };

/**
 * Work out every course a learner has started, from their completed lessons.
 *
 * Pure: give it the same inputs and it returns the same answer, with no
 * database or clock involved, so it's fully unit-tested.
 *
 * - progress = completed lessons ÷ lessons PLANNED for the whole course
 *   (so a course with only 3 of 10 lessons written can't look finished);
 * - next lesson = the first written lesson, in order, not yet completed;
 * - courses are sorted by when they were last studied, newest first.
 *
 * `lessons` must be in reading order.
 */
export function buildLearningActivities(
  completions: readonly ProgressCompletion[],
  lessons: readonly ProgressLesson[],
  schools: readonly School[],
): LearningActivityView[] {
  const completedAt = new Map(completions.map((c) => [c.lessonId, c.completedAt]));
  const startedCourses = new Set(
    lessons.filter((lesson) => completedAt.has(lesson.id)).map((lesson) => lesson.courseId),
  );

  const activities: LearningActivityView[] = [];
  for (const courseId of startedCourses) {
    const school = schools.find((s) => s.categories.some((c) => c.courses.some((co) => co.id === courseId)));
    const course = school?.categories.flatMap((c) => c.courses).find((co) => co.id === courseId);
    if (!school || !course) continue;

    const courseLessons = lessons.filter((lesson) => lesson.courseId === courseId);
    const done = courseLessons.filter((lesson) => completedAt.has(lesson.id));
    const planned = course.modules.reduce((sum, module) => sum + module.plannedLessons, 0);
    const next = courseLessons.find((lesson) => !completedAt.has(lesson.id));
    const nextModule = course.modules.find((module) => module.id === next?.moduleId);
    const lastStudiedAt = done
      .map((lesson) => completedAt.get(lesson.id)!)
      .reduce((latest, date) => (date > latest ? date : latest));

    activities.push({
      id: course.id,
      schoolSlug: school.slug,
      courseId: course.id,
      currentModuleTitle: nextModule?.title ?? "More lessons coming soon",
      progressPercent: planned > 0 ? Math.min(100, Math.floor((done.length / planned) * 100)) : 0,
      lastStudiedAt,
      ...(next ? { nextLesson: { id: next.id, title: next.title } } : {}),
      school: { slug: school.slug, name: school.name, shortName: school.shortName, icon: school.icon },
      course: { id: course.id, title: course.title },
    });
  }

  return activities.toSorted((a, b) => b.lastStudiedAt.localeCompare(a.lastStudiedAt));
}
