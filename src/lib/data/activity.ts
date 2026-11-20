/**
 * DATA LAYER: MISSIONS, OBJECTIVES, LEARNING ACTIVITY AND ACHIEVEMENTS
 * --------------------------------------------------------------------
 * The definitions (mission templates, achievements) are catalogue rows in the
 * database; the learner's own progress comes from their personal rows, which
 * Row Level Security limits to them. Same caching rules as character.ts.
 *
 * Everything here is display-only in Milestone 2: completing missions and
 * earning achievements is done by trusted database functions in Milestone 3.
 */
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { catalogueSchools } from "@/content/catalogue/schools";
import { buildLearningActivities } from "@/lib/progression/course-progress";
import { createSupabaseDataClient } from "@/lib/supabase/server";
import { getAllLessonLinks } from "./lessons";
import { getLessonCompletions } from "./progress";
import type { Achievement, DailyMission, LearningActivityView, WeeklyObjective } from "@/types/activity";
import type { DataResult } from "@/types/data";
import { LEARNER_DATA_TAG } from "./cache-tags";
import { toAchievements, toDailyMissions, toWeeklyObjectives, utcDay, utcWeekStart } from "./mappers";

async function loadTasks(kind: "daily" | "weekly", periodStart: string) {
  const supabase = await createSupabaseDataClient();
  const [templates, tasks] = await Promise.all([
    supabase.from("task_templates").select("*").eq("kind", kind),
    supabase.from("user_tasks").select("template_id, progress, status").eq("period_start", periodStart),
  ]);
  if (templates.error) throw new Error(`Couldn't load ${kind} tasks (${templates.error.code}).`);
  if (tasks.error) throw new Error(`Couldn't load your ${kind} progress (${tasks.error.code}).`);
  return { templates: templates.data, tasks: tasks.data };
}

export async function getDailyMissions(): Promise<DataResult<DailyMission[]>> {
  "use cache: private";
  cacheTag(LEARNER_DATA_TAG);
  cacheLife({ stale: 30 });

  const { templates, tasks } = await loadTasks("daily", utcDay(new Date()));
  return { data: toDailyMissions(templates, tasks), source: "database" };
}

export async function getWeeklyObjectives(): Promise<DataResult<WeeklyObjective[]>> {
  "use cache: private";
  cacheTag(LEARNER_DATA_TAG);
  cacheLife({ stale: 30 });

  const { templates, tasks } = await loadTasks("weekly", utcWeekStart(new Date()));
  return { data: toWeeklyObjectives(templates, tasks), source: "database" };
}

/**
 * Courses in progress, built from the learner's completed lessons and the
 * written lessons in the catalogue (see buildLearningActivities).
 */
export async function getLearningActivities(): Promise<DataResult<LearningActivityView[]>> {
  const [{ data: completions }, lessons] = await Promise.all([getLessonCompletions(), getAllLessonLinks()]);
  return { data: buildLearningActivities(completions, lessons, catalogueSchools), source: "database" };
}

export async function getAchievements(): Promise<DataResult<Achievement[]>> {
  "use cache: private";
  cacheTag(LEARNER_DATA_TAG);
  cacheLife({ stale: 30 });

  const supabase = await createSupabaseDataClient();
  const [all, earned] = await Promise.all([
    supabase.from("achievements").select("id, title, description, sort_order"),
    supabase.from("user_achievements").select("achievement_id, earned_at"),
  ]);
  if (all.error) throw new Error(`Couldn't load achievements (${all.error.code}).`);
  if (earned.error) throw new Error(`Couldn't load your achievements (${earned.error.code}).`);
  return { data: toAchievements(all.data, earned.data), source: "database" };
}
