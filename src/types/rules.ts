/**
 * RULES the database can verify.
 *
 * Every mission, objective and achievement is earned by a rule the database
 * checks from facts it already holds (completed lessons and the XP ledger),
 * never by a button the learner presses. These unions mirror the Postgres
 * enums `task_rule` and `achievement_rule` (src/types/database-contract.ts
 * fails to compile if they drift apart).
 */

/** Counted within a task's period (a UTC day, or a UTC week starting Monday). */
export type TaskRule =
  /** Lessons completed in the period. */
  | "lessons_completed"
  /** Modules finished in the period (every planned lesson in the module completed). */
  | "modules_completed";

/** Counted over the learner's whole history. */
export type AchievementRule =
  /** Lessons completed, ever. */
  | "lessons_completed"
  /** Different schools with at least one completed lesson. */
  | "schools_studied"
  /** Different schools where the learner has earned any XP. */
  | "schools_with_xp"
  /** The most XP earned in any single school. */
  | "school_xp"
  /** Total XP across everything. */
  | "total_xp"
  /** Longest run of consecutive UTC days with a completed lesson. */
  | "streak_days";

export interface TaskDefinition {
  id: string;
  kind: "daily" | "weekly";
  title: string;
  description: string;
  rule: TaskRule;
  target: number;
  /** Word shown after the numbers, e.g. "lessons". */
  unit: string;
  xpReward: number;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  rule: AchievementRule;
  /** Earned when the rule's value reaches this number. */
  threshold: number;
}
