/**
 * DATA LAYER: CHARACTER
 * ---------------------
 * Loads the profile and XP ledger, then calculates the character from them.
 *
 * This layer only READS XP. There is deliberately no function here that adds
 * XP: in Milestone 2 awarding XP becomes a server-side database function that
 * checks the learner really completed the lesson. See docs/DATABASE_DESIGN.md.
 */
import { sampleProfile, sampleTransactions } from "@/content/sample/character";
import { sampleSchools } from "@/content/sample/schools";
import { buildCharacterSummary } from "@/lib/progression/character";
import type { DataResult } from "@/types/data";
import type { CharacterSummary, XpTransaction } from "@/types/progression";

export async function getCharacterSummary(): Promise<DataResult<CharacterSummary>> {
  const summary = buildCharacterSummary({
    profile: sampleProfile,
    transactions: sampleTransactions,
    schools: sampleSchools,
  });
  return { data: summary, source: "sample" };
}

/** Newest transactions first. */
export async function getRecentXpTransactions(limit = 5): Promise<DataResult<XpTransaction[]>> {
  const recent = [...sampleTransactions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
  return { data: recent, source: "sample" };
}
