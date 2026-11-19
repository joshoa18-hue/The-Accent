import { Award, Lock } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { Achievement } from "@/types/activity";

type AchievementListProps = {
  achievements: Achievement[];
  /** Show at most this many (earned first). Leave out to show all. */
  limit?: number;
};

/** Earned achievements first (newest first), then locked placeholders. */
export function AchievementList({ achievements, limit }: AchievementListProps) {
  const sorted = [...achievements].sort((a, b) => {
    if (a.status !== b.status) return a.status === "earned" ? -1 : 1;
    return (b.earnedAt ?? "").localeCompare(a.earnedAt ?? "");
  });
  const shown = limit ? sorted.slice(0, limit) : sorted;

  return (
    <ul className="space-y-3">
      {shown.map((achievement) => {
        const earned = achievement.status === "earned";
        return (
          <li key={achievement.id} className="flex items-start gap-3">
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-lg border",
                earned
                  ? "border-gold-600/40 bg-gold-500/10 text-gold-300"
                  : "border-charcoal-700 bg-charcoal-800 text-slate-dim",
              )}
            >
              {earned ? <Award aria-hidden className="size-4" /> : <Lock aria-hidden className="size-4" />}
            </span>
            <div className="min-w-0">
              <p className={cn("text-sm font-medium", earned ? "text-parchment" : "text-mist")}>
                {achievement.title}
                <span className="sr-only">{earned ? " (earned)" : " (locked)"}</span>
              </p>
              <p className="text-xs text-slate-dim">
                {achievement.description}
                {earned && achievement.earnedAt && <> · Earned {formatDate(achievement.earnedAt)}</>}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
