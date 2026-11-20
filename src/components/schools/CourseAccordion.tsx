import Link from "next/link";
import { BookOpen, ChevronDown } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { LessonLink } from "@/lib/data/lessons";
import { courseAnchorId, routes } from "@/lib/routes";
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

type CourseAccordionProps = {
  course: Course;
  /** Written lessons by module id. Modules without an entry have none yet. */
  lessonsByModule?: Readonly<Record<string, readonly LessonLink[]>>;
};

/**
 * One expandable course.
 *
 * Built on the browser's own <details>/<summary> elements, so it opens and
 * closes with NO JavaScript, works with the keyboard (Enter/Space) and is
 * announced as "expanded/collapsed" by screen readers automatically.
 * Tailwind's `group-open:` styles react to the <details open> attribute.
 * Written lessons appear as links under their module.
 */
export function CourseAccordion({ course, lessonsByModule = {} }: CourseAccordionProps) {
  const status = statusBadges[course.status];
  const lessons = plannedLessonCount(course);
  const written = course.modules.reduce((sum, module) => sum + (lessonsByModule[module.id]?.length ?? 0), 0);

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
            {written > 0 ? ` · ${written} ready to read` : ""}
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
          {course.modules.map((module, index) => {
            const moduleLessons = lessonsByModule[module.id] ?? [];
            return (
              <li key={module.id} className="rounded-xl bg-charcoal-900/70 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-gold-700/40 text-xs font-semibold text-gold-300">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-parchment">{module.title}</span>
                  <span className="shrink-0 text-xs text-slate-dim">
                    {moduleLessons.length > 0
                      ? `${moduleLessons.length} of ${module.plannedLessons} lessons`
                      : `${module.plannedLessons} lessons`}
                  </span>
                </div>
                {moduleLessons.length > 0 ? (
                  <ul className="mt-2 space-y-1 pl-10">
                    {moduleLessons.map((lesson) => (
                      <li key={lesson.id}>
                        <Link
                          href={routes.lesson(lesson.id)}
                          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gold-300 transition-colors hover:bg-charcoal-800/70 hover:text-gold-200"
                        >
                          <BookOpen aria-hidden className="size-3.5 shrink-0" />
                          <span className="min-w-0 flex-1">
                            {lesson.order}. {lesson.title}
                          </span>
                          <span className="shrink-0 text-xs text-slate-dim">{lesson.minutes} min</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-xs text-slate-dim">
          {course.status === "planned"
            ? "This course is part of the curriculum plan. Its lessons will be written after the open courses."
            : written > 0
              ? "More lessons for this course are being written and will appear here as they're finished."
              : "Lessons for this course are being written and will appear here in an upcoming update."}
        </p>
      </div>
    </details>
  );
}
