import type { SchoolSlug } from "@/types/school";
import type { XpTransaction } from "@/types/progression";

/** Reject amounts that could never come from a valid ledger (e.g. 12.5 or NaN). */
function assertWholeNumber(transaction: XpTransaction) {
  if (!Number.isInteger(transaction.amount)) {
    throw new TypeError(
      `XP transaction "${transaction.id}" has an invalid amount: ${transaction.amount}`,
    );
  }
}

/**
 * Add up every transaction to get total XP.
 * Corrections can be negative, but a total can never fall below zero.
 */
export function sumXp(transactions: readonly XpTransaction[]): number {
  let total = 0;
  for (const transaction of transactions) {
    assertWholeNumber(transaction);
    total += transaction.amount;
  }
  return Math.max(0, total);
}

/** XP earned in each school, e.g. { "technology-computers-ai": 950, ... }. */
export function xpBySchool(
  transactions: readonly XpTransaction[],
): Partial<Record<SchoolSlug, number>> {
  const totals: Partial<Record<SchoolSlug, number>> = {};
  for (const transaction of transactions) {
    assertWholeNumber(transaction);
    if (!transaction.schoolSlug) continue;
    totals[transaction.schoolSlug] = (totals[transaction.schoolSlug] ?? 0) + transaction.amount;
  }
  return totals;
}
