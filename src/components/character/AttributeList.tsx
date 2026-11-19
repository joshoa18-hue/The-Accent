import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn, formatNumber } from "@/lib/utils";
import type { AttributeScore } from "@/types/progression";

type AttributeListProps = {
  attributes: AttributeScore[];
  /** "compact" for the dashboard; "detailed" adds descriptions and XP. */
  variant?: "compact" | "detailed";
};

/** The six character attributes, each with its rank and progress to the next rank. */
export function AttributeList({ attributes, variant = "compact" }: AttributeListProps) {
  const detailed = variant === "detailed";

  return (
    <ul className={cn("grid gap-x-6", detailed ? "gap-y-5 sm:grid-cols-2" : "gap-y-3.5")}>
      {attributes.map((attribute) => (
        <li key={attribute.key}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium text-parchment">{attribute.label}</span>
            <span className="text-xs text-mist">
              Rank <span className="font-semibold text-gold-300">{attribute.progress.level}</span>
            </span>
          </div>
          <ProgressBar
            size="sm"
            value={attribute.progress.xpIntoLevel}
            max={attribute.progress.xpSpanOfLevel}
            label={`${attribute.label} progress to rank ${attribute.progress.level + 1}`}
          />
          {detailed && (
            <p className="mt-1.5 text-xs text-slate-dim">
              {attribute.description} · {formatNumber(attribute.xp)} XP
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
