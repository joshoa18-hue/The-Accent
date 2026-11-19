import { SchoolIcon } from "@/components/icons/AppIcons";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Panel } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { routes } from "@/lib/routes";
import type { LearningActivityView } from "@/types/activity";

/**
 * Points the learner at the course they studied most recently.
 * The link opens the course outline on its school page. Lessons themselves
 * arrive in a later milestone, so we don't pretend to start one.
 */
export function ContinueLearningCard({ activity }: { activity: LearningActivityView | undefined }) {
  return (
    <Panel id="continue-learning" eyebrow="Pick up where you left off" title="Continue Learning">
      {activity ? (
        <div className="flex h-full flex-col">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-gold-700/40 bg-navy-800 text-gold-400">
              <SchoolIcon name={activity.school.icon} className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-dim">{activity.school.shortName}</p>
              <p className="font-display text-lg font-semibold leading-snug">{activity.course.title}</p>
              <p className="mt-0.5 text-sm text-mist">Next: {activity.currentModuleTitle}</p>
            </div>
          </div>
          <ProgressBar
            className="mt-5"
            value={activity.progressPercent}
            max={100}
            label={`${activity.course.title} course progress`}
          />
          <p className="mt-2 text-xs text-slate-dim">{activity.progressPercent}% of course complete</p>
          <ArrowLink
            variant="button"
            href={routes.course(activity.school.slug, activity.course.id)}
            className="mt-5 self-start"
          >
            View course outline
          </ArrowLink>
        </div>
      ) : (
        <div>
          <p className="text-sm text-mist">You haven&apos;t started a course yet.</p>
          <ArrowLink href={routes.schools()} className="mt-3">
            Explore the schools
          </ArrowLink>
        </div>
      )}
    </Panel>
  );
}
