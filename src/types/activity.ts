import type { SchoolIconName, SchoolSlug } from "./school";

export type TaskStatus = "not_started" | "in_progress" | "completed";

/** A small task that resets every day. */
export interface DailyMission {
  id: string;
  title: string;
  description: string;
  /** XP that the server will award once completion is verified (Milestone 2+). */
  xpReward: number;
  status: TaskStatus;
  schoolSlug?: SchoolSlug;
}

/** A larger goal measured over a week, e.g. "Study 5 sessions: 3 of 5". */
export interface WeeklyObjective {
  id: string;
  title: string;
  current: number;
  target: number;
  /** Word used after the numbers, e.g. "sessions" or "lessons". */
  unit: string;
  xpReward: number;
}

/** A course the learner is currently working through. */
export interface LearningActivity {
  id: string;
  schoolSlug: SchoolSlug;
  courseId: string;
  /** The module the learner will continue with. */
  currentModuleTitle: string;
  /** 0–100 */
  progressPercent: number;
  lastStudiedAt: string;
}

/**
 * A learning activity joined with the names the UI needs to display it.
 * The data layer builds this — like a SQL JOIN — so components never
 * have to look courses up themselves.
 */
export interface LearningActivityView extends LearningActivity {
  school: { slug: SchoolSlug; name: string; shortName: string; icon: SchoolIconName };
  course: { id: string; title: string };
}

export type AchievementStatus = "earned" | "locked";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  status: AchievementStatus;
  /** Only present when status is "earned". */
  earnedAt?: string;
}
