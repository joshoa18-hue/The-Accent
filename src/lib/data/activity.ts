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
import type { DataResult } from "@/types/data";
import type { Achievement, DailyMission, LearningActivity, WeeklyObjective } from "@/types/activity";

export async function getDailyMissions(): Promise<DataResult<DailyMission[]>> {
  return { data: sampleDailyMissions, source: "sample" };
}

export async function getWeeklyObjectives(): Promise<DataResult<WeeklyObjective[]>> {
  return { data: sampleWeeklyObjectives, source: "sample" };
}

/** Courses in progress, most recently studied first. */
export async function getLearningActivities(): Promise<DataResult<LearningActivity[]>> {
  const sorted = [...sampleLearningActivities].sort((a, b) =>
    b.lastStudiedAt.localeCompare(a.lastStudiedAt),
  );
  return { data: sorted, source: "sample" };
}

export async function getAchievements(): Promise<DataResult<Achievement[]>> {
  return { data: sampleAchievements, source: "sample" };
}
