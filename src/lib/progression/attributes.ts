import type { AttributeKey, MasteryTier } from "@/types/progression";

/**
 * The fixed rules of the attribute system. These are part of the game design,
 * not sample data, so they stay in code even after the database arrives.
 */
export const ATTRIBUTES: ReadonlyArray<{ key: AttributeKey; label: string; description: string }> = [
  { key: "wisdom", label: "Wisdom", description: "Sound judgement grounded in faith, history and reflection." },
  { key: "intellect", label: "Intellect", description: "Analytical and technical understanding." },
  { key: "strategy", label: "Strategy", description: "Planning, decision-making and enterprise." },
  { key: "creativity", label: "Creativity", description: "Imagination expressed through music and the arts." },
  { key: "eloquence", label: "Eloquence", description: "Clear, persuasive communication in any language." },
  { key: "discipline", label: "Discipline", description: "Habits, character and self-mastery." },
];

/** Turn a school mastery rank (0–10) into a named tier. */
export function masteryTierForRank(rank: number, hasXp: boolean): MasteryTier {
  if (!hasXp) return "Unranked";
  if (rank >= 10) return "Grandmaster";
  if (rank >= 8) return "Master";
  if (rank >= 6) return "Scholar";
  if (rank >= 4) return "Adept";
  if (rank >= 2) return "Apprentice";
  return "Novice";
}
