import type { LevelCurve, LevelProgress } from "@/types/progression";

/**
 * LEVELLING RULES
 * ---------------
 * Going from level L to level L+1 costs `baseXp × L`.
 * With baseXp = 100:  1→2 costs 100,  2→3 costs 200,  3→4 costs 300 ...
 *
 * So the TOTAL XP needed to reach a level is:
 *   baseXp × (1 + 2 + ... + (level-1))  =  baseXp × level × (level-1) / 2
 *
 * Level 1 → 0 XP,  level 2 → 100,  level 3 → 300,  level 4 → 600,  level 8 → 2,800
 */

/** The main character level. */
export const CHARACTER_CURVE: LevelCurve = { baseXp: 100, maxLevel: 100 };
/** Attribute ranks grow faster, because XP is spread across six attributes. */
export const ATTRIBUTE_CURVE: LevelCurve = { baseXp: 40, maxLevel: 50 };
/** Mastery inside one school. Rank 10 is the highest (Grandmaster). */
export const MASTERY_CURVE: LevelCurve = { baseXp: 60, maxLevel: 10 };

/** Total XP needed to reach `level`. */
export function xpRequiredForLevel(level: number, curve: LevelCurve): number {
  if (!Number.isInteger(level) || level < 1) {
    throw new RangeError(`Level must be a whole number of at least 1, received ${level}`);
  }
  const capped = Math.min(level, curve.maxLevel);
  return (curve.baseXp * capped * (capped - 1)) / 2;
}

/** The level reached with `totalXp`. Never below 1 or above the curve's maximum. */
export function levelForXp(totalXp: number, curve: LevelCurve): number {
  const xp = Math.max(0, Math.floor(totalXp));

  // Solve the formula above for "level" to get a fast first estimate...
  let level = Math.floor((1 + Math.sqrt(1 + (8 * xp) / curve.baseXp)) / 2);

  // ...then correct it, because decimal maths on computers can be off by a hair.
  while (level > 1 && xpRequiredForLevel(level, curve) > xp) level--;
  while (level < curve.maxLevel && xpRequiredForLevel(level + 1, curve) <= xp) level++;

  return Math.min(Math.max(level, 1), curve.maxLevel);
}

/** Everything the interface needs to show a level and its progress bar. */
export function getLevelProgress(totalXp: number, curve: LevelCurve): LevelProgress {
  const xp = Math.max(0, Math.floor(totalXp));
  const level = levelForXp(xp, curve);
  const isMaxLevel = level >= curve.maxLevel;
  const currentLevelXp = xpRequiredForLevel(level, curve);

  if (isMaxLevel) {
    return {
      level,
      totalXp: xp,
      currentLevelXp,
      nextLevelXp: null,
      xpIntoLevel: xp - currentLevelXp,
      xpSpanOfLevel: 0,
      xpToNextLevel: 0,
      progressPercent: 100,
      isMaxLevel,
    };
  }

  const nextLevelXp = xpRequiredForLevel(level + 1, curve);
  const xpIntoLevel = xp - currentLevelXp;
  const xpSpanOfLevel = nextLevelXp - currentLevelXp;

  return {
    level,
    totalXp: xp,
    currentLevelXp,
    nextLevelXp,
    xpIntoLevel,
    xpSpanOfLevel,
    xpToNextLevel: nextLevelXp - xp,
    progressPercent: Math.floor((xpIntoLevel / xpSpanOfLevel) * 100),
    isMaxLevel,
  };
}
