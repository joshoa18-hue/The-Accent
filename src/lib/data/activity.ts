/**
 * DATA LAYER: MISSIONS, OBJECTIVES, ACTIVITY AND ACHIEVEMENTS
 * Same pattern as schools.ts: sample data now, Supabase later.
 */
import {
  sampleAchievements,
  sampleDailyMissions,
  sampleLearningActivities,
  sampleWeeklyObjectives,
} from "@/content/sample/activity";
import { sampleSchools } from "@/content/sample/schools";
import type { DataResult } from "@/types/data";
import type {
  Achievement,
  DailyMission,
  LearningActivity,
  LearningActivityView,
  WeeklyObjective,
} from "@/types/activity";

export async function getDailyMissions(): Promise<DataResult<DailyMission[]>> {
  return { data: sampleDailyMissions, source: "sample" };
}

export async function getWeeklyObjectives(): Promise<DataResult<WeeklyObjective[]>> {
  return { data: sampleWeeklyObjectives, source: "sample" };
}

/** Attach the school and course names to an activity. Returns null if either is missing. */
function toView(activity: LearningActivity): LearningActivityView | null {
  const school = sampleSchools.find((s) => s.slug === activity.schoolSlug);
  const course = school?.categories
    .flatMap((category) => category.courses)
    .find((c) => c.id === activity.courseId);
  if (!school || !course) return null;

  return {
    ...activity,
    school: { slug: school.slug, name: school.name, shortName: school.shortName, icon: school.icon },
    course: { id: course.id, title: course.title },
  };
}

/** Courses in progress, most recently studied first, with display names attached. */
export async function getLearningActivities(): Promise<DataResult<LearningActivityView[]>> {
  const views = [...sampleLearningActivities]
    .sort((a, b) => b.lastStudiedAt.localeCompare(a.lastStudiedAt))
    .map(toView)
    // Skip any activity whose course no longer exists rather than crashing the page.
    .filter((view): view is LearningActivityView => view !== null);
  return { data: views, source: "sample" };
}

export async function getAchievements(): Promise<DataResult<Achievement[]>> {
  return { data: sampleAchievements, source: "sample" };
}
