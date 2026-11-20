/**
 * MAPPERS: database rows → the app's own types.
 *
 * The database speaks snake_case (`display_name`, `created_at`); the app
 * speaks camelCase and has its own shapes. Every conversion happens here, in
 * small PURE functions (no database, no cookies), so they're easy to test and
 * components never see database naming.
 */
import type { Database } from "@/types/database";
import type { Achievement, DailyMission, TaskStatus, WeeklyObjective } from "@/types/activity";
import type { CharacterProfile, XpTransaction } from "@/types/progression";
import type { SchoolSlug } from "@/types/school";

type Tables = Database["public"]["Tables"];
export type ProfileRow = Pick<Tables["profiles"]["Row"], "id" | "display_name" | "title" | "created_at">;
export type XpRow = Tables["xp_transactions"]["Row"];
export type TaskTemplateRow = Tables["task_templates"]["Row"];
export type UserTaskRow = Pick<Tables["user_tasks"]["Row"], "template_id" | "progress" | "status">;
export type AchievementRow = Pick<Tables["achievements"]["Row"], "id" | "title" | "description" | "sort_order">;
export type UserAchievementRow = Pick<Tables["user_achievements"]["Row"], "achievement_id" | "earned_at">;

export function toProfile(row: ProfileRow): CharacterProfile {
  return { id: row.id, displayName: row.display_name, title: row.title, joinedAt: row.created_at };
}

export function toXpTransaction(row: XpRow): XpTransaction {
  return {
    id: row.id,
    amount: row.amount,
    sourceType: row.source_type,
    sourceId: row.source_id,
    // The column is plain text; the catalogue's foreign key guarantees it's a real slug.
    schoolSlug: (row.school_slug ?? undefined) as SchoolSlug | undefined,
    description: row.description,
    createdAt: row.created_at,
  };
}

/** Index a learner's task rows by template, for quick lookups. */
function byTemplate(tasks: readonly UserTaskRow[]): Map<string, UserTaskRow> {
  return new Map(tasks.map((task) => [task.template_id, task]));
}

/** Today's missions: every daily template, with this learner's status if they've started it. */
export function toDailyMissions(
  templates: readonly TaskTemplateRow[],
  todaysTasks: readonly UserTaskRow[],
): DailyMission[] {
  const tasks = byTemplate(todaysTasks);
  return templates
    .filter((template) => template.kind === "daily")
    .toSorted((a, b) => a.sort_order - b.sort_order)
    .map((template) => {
      const status: TaskStatus = tasks.get(template.id)?.status ?? "not_started";
      return {
        id: template.id,
        title: template.title,
        description: template.description,
        xpReward: template.xp_reward,
        status,
        ...(template.school_slug ? { schoolSlug: template.school_slug as SchoolSlug } : {}),
      };
    });
}

/** This week's objectives, with the learner's progress (never more than the target). */
export function toWeeklyObjectives(
  templates: readonly TaskTemplateRow[],
  thisWeeksTasks: readonly UserTaskRow[],
): WeeklyObjective[] {
  const tasks = byTemplate(thisWeeksTasks);
  return templates
    .filter((template) => template.kind === "weekly")
    .toSorted((a, b) => a.sort_order - b.sort_order)
    .map((template) => ({
      id: template.id,
      title: template.title,
      current: Math.min(tasks.get(template.id)?.progress ?? 0, template.target),
      target: template.target,
      unit: template.unit,
      xpReward: template.xp_reward,
    }));
}

/** Every achievement, marked earned (with its date) or locked. */
export function toAchievements(
  achievements: readonly AchievementRow[],
  earned: readonly UserAchievementRow[],
): Achievement[] {
  const earnedAt = new Map(earned.map((row) => [row.achievement_id, row.earned_at]));
  return achievements
    .toSorted((a, b) => a.sort_order - b.sort_order)
    .map((achievement) => {
      const date = earnedAt.get(achievement.id);
      return date
        ? { id: achievement.id, title: achievement.title, description: achievement.description, status: "earned", earnedAt: date }
        : { id: achievement.id, title: achievement.title, description: achievement.description, status: "locked" };
    });
}

/** "2026-11-20" for the given moment, in UTC. Daily missions reset at midnight UTC. */
export function utcDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** The Monday (UTC) of the week containing `now`, as "YYYY-MM-DD". Weekly objectives reset on Mondays. */
export function utcWeekStart(now: Date): string {
  const day = now.getUTCDay(); // 0 = Sunday … 6 = Saturday
  const daysSinceMonday = (day + 6) % 7;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday));
  return utcDay(monday);
}
