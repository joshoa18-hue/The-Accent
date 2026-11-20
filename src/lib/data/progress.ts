/**
 * DATA LAYER: LESSON PROGRESS
 * ---------------------------
 * Which lessons the signed-in learner has completed, read from
 * lesson_completions (Row Level Security: only their own rows).
 * Same caching rules as character.ts: private, request-time, tagged.
 */
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createSupabaseDataClient } from "@/lib/supabase/server";
import type { DataResult } from "@/types/data";
import { LEARNER_DATA_TAG } from "./cache-tags";

export type LessonCompletion = { lessonId: string; completedAt: string };

export async function getLessonCompletions(): Promise<DataResult<LessonCompletion[]>> {
  "use cache: private";
  cacheTag(LEARNER_DATA_TAG);
  cacheLife({ stale: 30 });

  const supabase = await createSupabaseDataClient();
  const { data, error } = await supabase
    .from("lesson_completions")
    .select("lesson_id, completed_at")
    .order("completed_at", { ascending: false });
  if (error) throw new Error(`Couldn't load your lesson progress (${error.code}).`);
  return {
    data: data.map((row) => ({ lessonId: row.lesson_id, completedAt: row.completed_at })),
    source: "database",
  };
}
