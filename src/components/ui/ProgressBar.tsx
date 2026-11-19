import { cn } from "@/lib/utils";

type ProgressBarProps = {
  /** Current amount, e.g. 340 XP earned in this level. */
  value: number;
  /** Amount that means "full", e.g. 500 XP needed for this level. */
  max: number;
  /** Read aloud by screen readers, e.g. "Progress to level 8". */
  label: string;
  size?: "sm" | "md";
  className?: string;
};

/** Keep a number between a minimum and a maximum. */
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * An accessible progress bar. role="progressbar" plus the aria-value*
 * attributes let screen readers announce "Progress to level 8, 68%".
 */
export function ProgressBar({ value, max, label, size = "md", className }: ProgressBarProps) {
  const safeMax = max > 0 ? max : 1;
  const safeValue = clamp(value, 0, safeMax);
  const percent = Math.round((safeValue / safeMax) * 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={safeValue}
      aria-valuetext={`${percent}%`}
      className={cn(
        "w-full overflow-hidden rounded-full bg-navy-800 ring-1 ring-inset ring-charcoal-700",
        size === "sm" ? "h-1.5" : "h-2.5",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 transition-[width] duration-700 ease-ascent"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
