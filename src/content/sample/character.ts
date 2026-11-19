/**
 * ⚠ SAMPLE DATA — Milestone 1
 * A sample learner and their XP ledger. Totals, levels and mastery are NOT
 * written here — they are calculated from these transactions by
 * src/lib/progression/. In Milestone 2 this becomes rows in the
 * `profiles` and `xp_transactions` tables.
 */
import type { SchoolSlug } from "@/types/school";
import type { CharacterProfile, XpSourceType, XpTransaction } from "@/types/progression";

export const sampleProfile: CharacterProfile = {
  id: "sample-learner",
  displayName: "Seeker",
  title: "Initiate of the Ascent",
  joinedAt: "2026-10-01T08:00:00Z",
};

/** Helper so each ledger line fits on one row. */
function tx(
  id: string,
  amount: number,
  sourceType: XpSourceType,
  sourceId: string,
  schoolSlug: SchoolSlug | undefined,
  description: string,
  createdAt: string,
): XpTransaction {
  return { id, amount, sourceType, sourceId, schoolSlug, description, createdAt };
}

const TECH = "technology-computers-ai";
const FAITH = "faith-scripture-wisdom";
const PERSONAL = "personal-development-human-skills";
const STRATEGY = "strategy-critical-thinking";
const BUSINESS = "business-entrepreneurship-finance";
const LANGUAGES = "languages-communication";
const HISTORY = "history-culture-philosophy";

export const sampleTransactions: XpTransaction[] = [
  tx("tx-01", 120, "lesson", "tech-how-computers-work-1", TECH, "Bits, Bytes and Binary", "2026-10-02T18:00:00Z"),
  tx("tx-02", 120, "lesson", "faith-bible-overview-1", FAITH, "How the Bible Is Organised", "2026-10-03T07:30:00Z"),
  tx("tx-03", 150, "lesson", "tech-how-computers-work-2", TECH, "Processors and Memory", "2026-10-06T18:00:00Z"),
  tx("tx-04", 100, "lesson", "personal-habits-course-1", PERSONAL, "How Habits Form", "2026-10-08T07:00:00Z"),
  tx("tx-05", 25, "mission", "daily-2026-10-08", undefined, "Daily mission: focused study", "2026-10-08T21:00:00Z"),
  tx("tx-06", 180, "lesson", "tech-how-computers-work-3", TECH, "Networks and the Internet", "2026-10-11T18:00:00Z"),
  tx("tx-07", 150, "lesson", "faith-bible-overview-2", FAITH, "Law, History and Covenant (part 1)", "2026-10-13T07:30:00Z"),
  tx("tx-08", 180, "lesson", "strategy-critical-thinking-1", STRATEGY, "Anatomy of an Argument", "2026-10-15T19:00:00Z"),
  tx("tx-09", 25, "mission", "daily-2026-10-16", undefined, "Daily mission: focused study", "2026-10-16T21:00:00Z"),
  tx("tx-10", 130, "lesson", "business-personal-finance-1", BUSINESS, "Budgeting and Cash Flow", "2026-10-18T10:00:00Z"),
  tx("tx-11", 200, "lesson", "tech-web-development-1", TECH, "HTML and CSS Essentials", "2026-10-21T18:00:00Z"),
  tx("tx-12", 120, "lesson", "personal-habits-course-2", PERSONAL, "Designing Your Environment (part 1)", "2026-10-23T07:00:00Z"),
  tx("tx-13", 100, "lesson", "languages-clear-writing-1", LANGUAGES, "Sentences That Work", "2026-10-25T14:00:00Z"),
  tx("tx-14", 25, "mission", "daily-2026-10-27", undefined, "Daily mission: focused study", "2026-10-27T21:00:00Z"),
  // A duplicate award was recorded by mistake; this correction reverses it.
  tx("tx-15", 25, "mission", "daily-2026-10-27", undefined, "Daily mission: focused study (duplicate)", "2026-10-27T21:00:05Z"),
  tx("tx-16", -25, "adjustment", "tx-15", undefined, "Correction: reverse duplicate mission award", "2026-10-28T09:00:00Z"),
  tx("tx-17", 200, "lesson", "faith-bible-overview-2", FAITH, "Law, History and Covenant (part 2)", "2026-10-30T07:30:00Z"),
  tx("tx-18", 180, "lesson", "history-civilisations-1", HISTORY, "The Ancient World (part 1)", "2026-11-01T16:00:00Z"),
  tx("tx-19", 150, "lesson", "tech-web-development-2", TECH, "TypeScript Fundamentals (part 1)", "2026-11-03T18:00:00Z"),
  tx("tx-20", 130, "lesson", "personal-habits-course-2", PERSONAL, "Designing Your Environment (part 2)", "2026-11-05T07:00:00Z"),
  tx("tx-21", 200, "lesson", "strategy-critical-thinking-2", STRATEGY, "Common Fallacies (part 1)", "2026-11-07T19:00:00Z"),
  tx("tx-22", 130, "lesson", "business-personal-finance-2", BUSINESS, "Debt and Credit", "2026-11-09T10:00:00Z"),
  tx("tx-23", 30, "objective", "weekly-2026-w45", undefined, "Weekly objective: five study sessions", "2026-11-09T21:00:00Z"),
  tx("tx-24", 150, "lesson", "faith-bible-overview-2", FAITH, "Law, History and Covenant (part 3)", "2026-11-11T07:30:00Z"),
  tx("tx-25", 120, "lesson", "languages-clear-writing-2", LANGUAGES, "Structuring an Argument (part 1)", "2026-11-13T14:00:00Z"),
  tx("tx-26", 150, "lesson", "tech-web-development-2", TECH, "TypeScript Fundamentals (part 2)", "2026-11-16T18:00:00Z"),
  tx("tx-27", 130, "lesson", "personal-habits-course-3", PERSONAL, "Time and Energy Management (part 1)", "2026-11-17T07:00:00Z"),
  tx("tx-28", 25, "mission", "daily-2026-11-18", undefined, "Daily mission: focused study", "2026-11-18T21:00:00Z"),
];
