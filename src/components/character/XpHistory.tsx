import { cn, formatDate, formatNumber } from "@/lib/utils";
import type { XpTransaction } from "@/types/progression";

const sourceLabels: Record<XpTransaction["sourceType"], string> = {
  lesson: "Lesson",
  course: "Course",
  mission: "Mission",
  objective: "Objective",
  achievement: "Achievement",
  adjustment: "Correction",
};

/**
 * The most recent lines of the XP ledger — the actual records that every
 * level, attribute and mastery number on this page is calculated from.
 */
export function XpHistory({ transactions }: { transactions: XpTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-mist">
        No XP yet. Every lesson, mission and achievement you complete will be recorded here.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-charcoal-800">
      {transactions.map((tx) => {
        const negative = tx.amount < 0;
        return (
          <li key={tx.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm text-parchment">{tx.description}</p>
              <p className="text-xs text-slate-dim">
                {sourceLabels[tx.sourceType]} · {formatDate(tx.createdAt)}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 text-sm font-semibold tabular-nums",
                negative ? "text-ember" : "text-gold-300",
              )}
            >
              {negative ? "−" : "+"}
              {formatNumber(Math.abs(tx.amount))} XP
            </span>
          </li>
        );
      })}
    </ul>
  );
}
