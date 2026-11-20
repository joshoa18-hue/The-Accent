/**
 * Achievements: honours earned automatically by the database when a rule's
 * value reaches its threshold. They award no XP of their own.
 *
 * XP thresholds are calculated from the SAME level curves the app displays
 * with, so "Scholar's Rank" here always matches the "Scholar" tier on screen.
 * Imports use .ts extensions because the seed script runs this file with Node.
 */
import type { AchievementDefinition } from "@/types/rules";
import { CHARACTER_CURVE, MASTERY_CURVE, xpRequiredForLevel } from "../../lib/progression/levels.ts";

/** Mastery rank at which a school's tier becomes "Scholar" (see masteryTierForRank). */
export const SCHOLAR_MASTERY_RANK = 6;

export const catalogueAchievements: readonly AchievementDefinition[] = [
  {
    id: "first-step",
    title: "First Step",
    description: "Complete your first lesson.",
    rule: "lessons_completed",
    threshold: 1,
  },
  {
    id: "three-schools",
    title: "Wide Horizons",
    description: "Complete lessons in three different schools.",
    rule: "schools_studied",
    threshold: 3,
  },
  {
    id: "scholar-rank",
    title: "Scholar's Rank",
    description: "Reach Scholar mastery in any school.",
    rule: "school_xp",
    threshold: xpRequiredForLevel(SCHOLAR_MASTERY_RANK, MASTERY_CURVE),
  },
  {
    id: "polymath",
    title: "Polymath",
    description: "Earn XP in all eight schools.",
    rule: "schools_with_xp",
    threshold: 8,
  },
  {
    id: "thirty-days",
    title: "Steadfast",
    description: "Complete a lesson on 30 days in a row.",
    rule: "streak_days",
    threshold: 30,
  },
  {
    id: "level-twenty-five",
    title: "The High Road",
    description: "Reach character level 25.",
    rule: "total_xp",
    threshold: xpRequiredForLevel(25, CHARACTER_CURVE),
  },
];
