import Link from "next/link";
import { SchoolIcon } from "@/components/icons/AppIcons";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { routes } from "@/lib/routes";
import type { SchoolMastery } from "@/types/progression";
import type { School } from "@/types/school";

type SchoolMasteryGridProps = {
  schools: School[];
  mastery: SchoolMastery[];
};

/** The eight schools as compact tiles showing the learner's mastery in each. */
export function SchoolMasteryGrid({ schools, mastery }: SchoolMasteryGridProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {schools.map((school) => {
        const m = mastery.find((entry) => entry.schoolSlug === school.slug);
        const ranked = m && m.tier !== "Unranked";
        return (
          <li key={school.slug}>
            <Link
              href={routes.school(school.slug)}
              className="group flex h-full flex-col rounded-2xl border border-charcoal-700/70 bg-navy-900/60 p-4 transition duration-300 ease-ascent hover:-translate-y-0.5 hover:border-gold-600/50"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy-800 text-gold-400">
                  <SchoolIcon name={school.icon} className="size-4" />
                </span>
                <span className="text-sm font-medium leading-tight text-parchment group-hover:text-gold-200">
                  {school.shortName}
                </span>
              </div>
              <div className="mt-auto pt-4">
                <p className="mb-1.5 text-xs text-slate-dim">
                  {ranked ? (
                    <>
                      <span className="font-semibold text-gold-300">{m.tier}</span> · Rank {m.progress.level}
                    </>
                  ) : (
                    "Not yet started"
                  )}
                </p>
                <ProgressBar
                  size="sm"
                  value={m?.progress.xpIntoLevel ?? 0}
                  max={m?.progress.xpSpanOfLevel ?? 1}
                  label={`${school.shortName} mastery progress`}
                />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
