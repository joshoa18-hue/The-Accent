import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  gold: "border-gold-600/40 bg-gold-500/10 text-gold-300",
  navy: "border-navy-500/50 bg-navy-700/60 text-mist",
  success: "border-emerald-soft/30 bg-emerald-soft/10 text-emerald-soft",
  muted: "border-charcoal-600 bg-charcoal-800 text-slate-dim",
} as const;

/** The allowed tone names are taken straight from the object above. */
export type BadgeTone = keyof typeof tones;

type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
};

/** A small label, e.g. "Foundation", "Completed" or "Sample data". */
export function Badge({ tone = "navy", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
