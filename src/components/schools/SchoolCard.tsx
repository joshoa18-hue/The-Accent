import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SchoolIcon } from "@/components/icons/AppIcons";
import { Card } from "@/components/ui/Card";
import type { School } from "@/types/school";

/** A clickable summary of one school. The whole card is a single link. */
export function SchoolCard({ school }: { school: School }) {
  const courseCount = school.categories.reduce((sum, category) => sum + category.courses.length, 0);

  return (
    <Link href={`/schools/${school.slug}`} className="group block h-full rounded-2xl">
      <Card interactive className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-11 place-items-center rounded-xl border border-gold-700/40 bg-navy-800 text-gold-400">
            <SchoolIcon name={school.icon} className="size-5" />
          </span>
          <ArrowRight
            aria-hidden
            className="size-4 text-slate-dim transition duration-300 ease-ascent group-hover:translate-x-0.5 group-hover:text-gold-400"
          />
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold text-parchment">{school.name}</h3>
        <p className="mt-1 text-sm text-mist">{school.tagline}</p>
        <p className="mt-auto pt-4 text-xs text-slate-dim">
          {school.categories.length} categories · {courseCount} courses
        </p>
      </Card>
    </Link>
  );
}
