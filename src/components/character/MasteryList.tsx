import Link from "next/link";
import { SchoolIcon } from "@/components/icons/AppIcons";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { routes } from "@/lib/routes";
import { cn, formatNumber } from "@/lib/utils";
import type { SchoolMastery } from "@/types/progression";
import type { School } from "@/types/school";

type MasteryListProps = {
  schools: School[];
  mastery: SchoolMastery[];
};

/** Subject-specific mastery: one row per school, linking to that school. */
export function MasteryList({ schools, mastery }: MasteryListProps) {
  return (
    <ul className="-mx-2 divide-y divide-charcoal-800">
      {schools.map((school) => {
        const m = mastery.find((entry) => entry.schoolSlug === school.slug);
        const ranked = !!m && m.tier !== "Unranked";
        return (
          <li key={school.slug}>
            <Link
              href={routes.school(school.slug)}
              className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-charcoal-800/60"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy-800 text-gold-500">
                <SchoolIcon name={school.icon} className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium text-parchment">{school.name}</span>
                  <span className={cn("shrink-0 text-xs font-semibold", ranked ? "text-gold-300" : "text-slate-dim")}>
                    {ranked ? `${m.tier} · Rank ${m.progress.level}` : "Unranked"}
                  </span>
                </span>
                <ProgressBar
                  className="mt-2"
                  size="sm"
                  value={m?.progress.xpIntoLevel ?? 0}
                  max={m?.progress.xpSpanOfLevel ?? 1}
                  label={`${school.shortName} mastery progress`}
                />
                <span className="mt-1 block text-xs text-slate-dim">{formatNumber(m?.xp ?? 0)} XP</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
