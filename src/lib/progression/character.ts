import type { School } from "@/types/school";
import type { CharacterProfile, CharacterSummary, XpTransaction } from "@/types/progression";
import { ATTRIBUTES, masteryTierForRank } from "./attributes";
import { sumXp, xpBySchool } from "./ledger";
import { ATTRIBUTE_CURVE, CHARACTER_CURVE, MASTERY_CURVE, getLevelProgress } from "./levels";

type BuildCharacterInput = {
  profile: CharacterProfile;
  transactions: readonly XpTransaction[];
  schools: readonly School[];
};

/**
 * Calculate the whole character from the XP ledger.
 *
 * Nothing here is stored: level, attributes and mastery are all derived from
 * the transactions every time. One source of truth means they can never
 * disagree with each other.
 */
export function buildCharacterSummary({
  profile,
  transactions,
  schools,
}: BuildCharacterInput): CharacterSummary {
  const schoolXp = xpBySchool(transactions);

  const mastery = schools.map((school) => {
    const xp = Math.max(0, schoolXp[school.slug] ?? 0);
    const progress = getLevelProgress(xp, MASTERY_CURVE);
    return {
      schoolSlug: school.slug,
      schoolName: school.shortName,
      xp,
      tier: masteryTierForRank(progress.level, xp > 0),
      progress,
    };
  });

  const attributes = ATTRIBUTES.map((attribute) => {
    // An attribute's XP is the XP of every school that feeds it.
    const xp = schools
      .filter((school) => school.primaryAttribute === attribute.key)
      .reduce((sum, school) => sum + Math.max(0, schoolXp[school.slug] ?? 0), 0);
    return { ...attribute, xp, progress: getLevelProgress(xp, ATTRIBUTE_CURVE) };
  });

  return {
    profile,
    level: getLevelProgress(sumXp(transactions), CHARACTER_CURVE),
    attributes,
    mastery,
  };
}
