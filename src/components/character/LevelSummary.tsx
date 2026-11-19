import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatNumber } from "@/lib/utils";
import type { LevelProgress } from "@/types/progression";

/** Level badge, total XP and the progress bar to the next level. */
export function LevelSummary({ level }: { level: LevelProgress }) {
  return (
    <div className="flex items-center gap-5">
      <div
        className="grid size-20 shrink-0 place-items-center rounded-2xl border border-gold-600/40 bg-gradient-to-b from-navy-700 to-navy-900 shadow-inner shadow-gold-900/20"
        aria-hidden
      >
        <div className="text-center leading-none">
          <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold-500">Level</span>
          <span className="font-display text-4xl font-semibold text-gold-300">{level.level}</span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="sr-only">Level {level.level}.</p>
        <p className="text-sm text-mist">
          <span className="font-semibold text-parchment">{formatNumber(level.totalXp)} XP</span> earned in total
        </p>
        {level.isMaxLevel ? (
          <p className="mt-3 text-sm text-gold-300">Maximum level reached.</p>
        ) : (
          <>
            <ProgressBar
              className="mt-3"
              value={level.xpIntoLevel}
              max={level.xpSpanOfLevel}
              label={`Progress to level ${level.level + 1}`}
            />
            <p className="mt-2 text-xs text-slate-dim">
              {formatNumber(level.xpIntoLevel)} / {formatNumber(level.xpSpanOfLevel)} XP ·{" "}
              {formatNumber(level.xpToNextLevel)} XP to level {level.level + 1}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
