/**
 * DATA LAYER: CHARACTER
 * ---------------------
 * Loads the signed-in learner's profile and XP ledger from Supabase, then
 * calculates the character from them (levels are never stored).
 *
 * Every query runs AS the learner (their session cookie), so Row Level
 * Security returns only their own rows. There is deliberately no function
 * here that adds XP: that's the database's award_xp function (Milestone 3).
 *
 * "use cache: private": these read cookies and the clock, so they run at
 * request time; the result is shared within one request and never stored in a
 * server-wide cache. Callers must sit inside <Suspense> after requireUser().
 */
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { catalogueSchools } from "@/content/catalogue/schools";
import { buildCharacterSummary } from "@/lib/progression/character";
import { createSupabaseDataClient } from "@/lib/supabase/server";
import type { DataResult } from "@/types/data";
import type { CharacterSummary, XpTransaction } from "@/types/progression";
import { LEARNER_DATA_TAG } from "./cache-tags";
import { toProfile, toXpTransaction } from "./mappers";

export async function getCharacterSummary(): Promise<DataResult<CharacterSummary>> {
  "use cache: private";
  cacheTag(LEARNER_DATA_TAG);
  cacheLife({ stale: 30 });

  const supabase = await createSupabaseDataClient();
  const [profile, ledger] = await Promise.all([
    // RLS: only the learner's own profile is visible, so exactly one row comes back.
    supabase.from("profiles").select("id, display_name, title, created_at").single(),
    supabase.from("xp_transactions").select("*").order("created_at"),
  ]);
  if (profile.error) throw new Error(`Couldn't load your profile (${profile.error.code}).`);
  if (ledger.error) throw new Error(`Couldn't load your XP history (${ledger.error.code}).`);

  const summary = buildCharacterSummary({
    profile: toProfile(profile.data),
    transactions: ledger.data.map(toXpTransaction),
    schools: catalogueSchools,
  });
  return { data: summary, source: "database" };
}

/** The learner's most recent XP entries, newest first. */
export async function getRecentXpTransactions(limit = 5): Promise<DataResult<XpTransaction[]>> {
  "use cache: private";
  cacheTag(LEARNER_DATA_TAG);
  cacheLife({ stale: 30 });

  const supabase = await createSupabaseDataClient();
  const { data, error } = await supabase
    .from("xp_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Couldn't load your XP history (${error.code}).`);
  return { data: data.map(toXpTransaction), source: "database" };
}
