import Link from "next/link";
import { SchoolIcon } from "@/components/icons/AppIcons";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { routes } from "@/lib/routes";
import { formatDate } from "@/lib/utils";
import type { LearningActivityView } from "@/types/activity";

/** Every course currently in progress; each row links to its course outline. */
export function LearningActivityList({ activities }: { activities: LearningActivityView[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-mist">No courses in progress yet.</p>;
  }

  return (
    <ul className="-mx-2 space-y-1">
      {activities.map((activity) => (
        <li key={activity.id}>
          <Link
            href={routes.course(activity.school.slug, activity.course.id)}
            className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors duration-200 hover:bg-charcoal-800/70"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy-800 text-gold-500">
              <SchoolIcon name={activity.school.icon} className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-parchment">{activity.course.title}</span>
              <span className="block truncate text-xs text-slate-dim">
                {activity.currentModuleTitle} · {formatDate(activity.lastStudiedAt)}
              </span>
              <ProgressBar
                className="mt-2"
                size="sm"
                value={activity.progressPercent}
                max={100}
                label={`${activity.course.title} progress`}
              />
            </span>
            <span className="w-10 shrink-0 text-right text-xs font-semibold text-gold-300">
              {activity.progressPercent}%
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
