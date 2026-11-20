import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight, Clock, Sparkles } from "lucide-react";
import { SchoolIcon } from "@/components/icons/AppIcons";
import { LessonBlocks } from "@/components/lessons/LessonBlocks";
import { QuizPreview } from "@/components/lessons/QuizPreview";
import { QuizSection } from "@/components/lessons/QuizSection";
import { Panel } from "@/components/ui/Panel";
import { getLessonPage, type LessonLink } from "@/lib/data/lessons";
import { routes } from "@/lib/routes";

function NeighbourLink({ link, direction }: { link: LessonLink; direction: "previous" | "next" }) {
  const isNext = direction === "next";
  return (
    <Link
      href={routes.lesson(link.id)}
      className={`group flex flex-1 flex-col rounded-2xl border border-charcoal-700/70 bg-charcoal-900/60 p-4 transition-colors hover:border-gold-600/50 ${isNext ? "items-end text-right" : ""}`}
    >
      <span className="flex items-center gap-1.5 text-xs text-slate-dim">
        {isNext ? null : <ArrowLeft aria-hidden className="size-3.5" />}
        {isNext ? "Next lesson" : "Previous lesson"}
        {isNext ? <ArrowRight aria-hidden className="size-3.5" /> : null}
      </span>
      <span className="mt-1 font-display text-lg text-parchment group-hover:text-gold-300">{link.title}</span>
    </Link>
  );
}

/** The URL-dependent part of the lesson page (inside <Suspense>). */
export async function LessonDetails({ params }: Pick<PageProps<"/lessons/[lessonId]">, "params">) {
  const { lessonId } = await params;
  const { data: page } = await getLessonPage(lessonId);
  if (!page) notFound();

  const { lesson, quiz, school, course, module, moduleNumber, previous, next } = page;

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-dim">
          <li>
            <Link href={routes.schools()} className="hover:text-gold-300">
              Schools
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            <Link href={routes.school(school.slug)} className="hover:text-gold-300">
              {school.shortName}
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            <Link href={routes.course(school.slug, course.id)} className="hover:text-gold-300">
              {course.title}
            </Link>
          </li>
        </ol>
      </nav>

      <header className="space-y-3">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
          <SchoolIcon name={school.icon} className="size-4" />
          Module {moduleNumber} · {module.title} · Lesson {lesson.order}
        </p>
        <h1 className="font-display text-4xl font-semibold leading-tight text-parchment sm:text-5xl">{lesson.title}</h1>
        <p className="text-lg text-mist">{lesson.summary}</p>
        <p className="flex flex-wrap items-center gap-4 text-sm text-slate-dim">
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden className="size-4" />
            About {lesson.minutes} minutes
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles aria-hidden className="size-4 text-gold-500" />
            {lesson.xpReward} XP when completed
          </span>
        </p>
      </header>

      <div className="rounded-3xl border border-charcoal-700/70 bg-charcoal-900/50 p-6 sm:p-8">
        <LessonBlocks blocks={lesson.blocks} />
      </div>

      <Panel id="lesson-quiz" eyebrow="Check your understanding" title="Lesson Quiz">
        {/* Reads the session, so it streams in; the read-only questions show meanwhile. */}
        <Suspense fallback={<QuizPreview questions={quiz} />}>
          <QuizSection lessonId={lesson.id} questions={quiz} xpReward={lesson.xpReward} />
        </Suspense>
      </Panel>

      {previous || next ? (
        <nav aria-label="Lessons in this course" className="flex flex-col gap-3 sm:flex-row">
          {previous ? <NeighbourLink link={previous} direction="previous" /> : <span className="hidden flex-1 sm:block" />}
          {next ? <NeighbourLink link={next} direction="next" /> : null}
        </nav>
      ) : null}
    </article>
  );
}

export function LessonDetailsSkeleton() {
  return (
    <div role="status" aria-label="Loading lesson" className="mx-auto max-w-3xl space-y-6">
      <div className="h-5 w-64 animate-pulse rounded bg-charcoal-800/70" />
      <div className="h-14 w-3/4 animate-pulse rounded-xl bg-charcoal-800/70" />
      <div className="h-96 animate-pulse rounded-3xl bg-charcoal-900/70" />
    </div>
  );
}
