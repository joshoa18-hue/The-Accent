import type { SchoolSlug } from "./school";

/** The six character attributes. Each school feeds one of them. */
export type AttributeKey =
  | "wisdom"
  | "intellect"
  | "strategy"
  | "creativity"
  | "eloquence"
  | "discipline";

/** What earned the XP. Used later to stop the same thing paying out twice. */
export type XpSourceType = "lesson" | "course" | "mission" | "objective" | "achievement" | "adjustment";

/**
 * One line in the XP ledger.
 *
 * XP is never stored as a single editable number. Instead every award is
 * recorded as a transaction, and totals are calculated by adding them up.
 * Like a bank statement, this gives a full history, makes mistakes
 * correctable (with an "adjustment" line) and makes cheating detectable.
 *
 * In Milestone 2 these rows live in the `xp_transactions` table and can only
 * be inserted by trusted server code — never by the browser.
 */
export interface XpTransaction {
  id: string;
  /** Whole number. Negative only for corrections ("adjustment"). */
  amount: number;
  sourceType: XpSourceType;
  /** The id of the lesson, mission, etc. that earned the XP. */
  sourceId: string;
  /** Set when the XP was earned inside a school. */
  schoolSlug?: SchoolSlug;
  description: string;
  /** ISO 8601 timestamp, e.g. "2026-11-12T09:30:00Z". */
  createdAt: string;
}

/** Settings for a levelling curve. Each level costs `baseXp` more than the last. */
export interface LevelCurve {
  baseXp: number;
  maxLevel: number;
}

/** Everything the UI needs to draw a level and its progress bar. */
export interface LevelProgress {
  level: number;
  totalXp: number;
  /** Total XP at which the current level started. */
  currentLevelXp: number;
  /** Total XP needed for the next level, or null at the maximum level. */
  nextLevelXp: number | null;
  /** XP earned since reaching the current level. */
  xpIntoLevel: number;
  /** Size of the current level, from its start to the next level. 0 at max level. */
  xpSpanOfLevel: number;
  /** XP still needed for the next level. 0 at max level. */
  xpToNextLevel: number;
  /** 0–100, rounded down. */
  progressPercent: number;
  isMaxLevel: boolean;
}

export interface CharacterProfile {
  id: string;
  displayName: string;
  /** Flavour title shown under the name, e.g. "Seeker of Wisdom". */
  title: string;
  joinedAt: string;
}

export interface AttributeScore {
  key: AttributeKey;
  label: string;
  description: string;
  xp: number;
  progress: LevelProgress;
}

export type MasteryTier = "Unranked" | "Novice" | "Apprentice" | "Adept" | "Scholar" | "Master" | "Grandmaster";

export interface SchoolMastery {
  schoolSlug: SchoolSlug;
  schoolName: string;
  xp: number;
  tier: MasteryTier;
  progress: LevelProgress;
}

/** The fully calculated character, ready to display. */
export interface CharacterSummary {
  profile: CharacterProfile;
  level: LevelProgress;
  attributes: AttributeScore[];
  mastery: SchoolMastery[];
}
