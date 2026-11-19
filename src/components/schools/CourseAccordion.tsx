import { ChevronDown } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { courseAnchorId } from "@/lib/routes";
import type { Course, CourseLevel, CourseStatus } from "@/types/school";

const levelLabels: Record<CourseLevel, string> = {
  foundation: "Foundation",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const statusBadges: Record<CourseStatus, { label: string; tone: BadgeTone }> = {
  open: { label: "Open", tone: "gold" },
  planned: { label: "Planned", tone: "muted" },
};

/** Total lessons planned across a course's modules. */
export function plannedLessonCount(course: Course): number {
  return course.modules.reduce((sum, module) => sum + module.plannedLessons, 0);
}

/**
 * One expandable course.
 *
 * Built on the browser's own <details>/<summary> elements, so it opens and
 * closes with NO JavaScript, works with the keyboard (Enter/Space) and is
 * announced as "expanded/collapsed" by screen readers automatically.
 * Tailwind's `group-open:` styles react to the <details open> attribute.
 */
export function CourseAccordion({ course }: { course: Course }) {
  const status = statusBadges[course.status];
  const lessons = plannedLessonCount(course);

  return (
    <details
      id={courseAnchorId(course.id)}
      className="group scroll-mt-24 rounded-2xl border border-charcoal-700/70 bg-navy-900/50 transition-colors duration-300 open:border-gold-700/50 open:bg-navy-900/80"
    >
      <summary className="flex cursor-pointer items-start gap-3 rounded-2xl p-4 transition-colors hover:bg-charcoal-800/40 sm:p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-parchment">{course.title}</h3>
            <Badge tone={status.tone}>{status.label}</Badge>
            <Badge tone="navy">{levelLabels[course.level]}</Badge>
          </div>
          <p className="mt-1 text-sm text-mist">{course.summary}</p>
          <p className="mt-1.5 text-xs text-slate-dim">
            {course.modules.length} modules · {lessons} lessons planned
          </p>
        </div>
        <ChevronDown
          aria-hidden
          className="mt-1 size-5 shrink-0 text-gold-500 transition-transform duration-300 ease-ascent group-open:rotate-180"
        />
      </summary>

      <div className="border-t border-charcoal-700/60 px-4 pt-4 pb-5 sm:px-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">Course structure</p>
        <ol className="space-y-2">
          {course.modules.map((module, index) => (
            <li key={module.id} className="flex items-center gap-3 rounded-xl bg-charcoal-900/70 px-3 py-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full border border-gold-700/40 text-xs font-semibold text-gold-300">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm text-parchment">{module.title}</span>
              <span className="shrink-0 text-xs text-slate-dim">{module.plannedLessons} lessons</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-slate-dim">
          {course.status === "open"
            ? "Lessons for this course are being written and will appear here in an upcoming milestone."
            : "This course is part of the curriculum plan. Its lessons will be written after the open courses."}
        </p>
      </div>
    </details>
  );
}
