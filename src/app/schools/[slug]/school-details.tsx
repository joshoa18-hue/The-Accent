import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { SchoolIcon } from "@/components/icons/AppIcons";
import { CourseAccordion, plannedLessonCount } from "@/components/schools/CourseAccordion";
import { CourseHashOpener } from "@/components/schools/CourseHashOpener";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SampleDataNotice } from "@/components/ui/SampleDataNotice";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { getCurrentUser } from "@/lib/auth/session";
import { getCharacterSummary } from "@/lib/data/character";
import { getLessonLinksByModule } from "@/lib/data/lessons";
import { getSchoolBySlug } from "@/lib/data/schools";
import { combineSources } from "@/lib/data/source";
import { ATTRIBUTES } from "@/lib/progression/attributes";
import { routes } from "@/lib/routes";
import { formatNumber } from "@/lib/utils";

/**
 * The part of the school page that depends on the URL.
 * It receives `params` as a Promise and awaits it HERE, inside the page's
 * <Suspense> boundary, so the rest of the page can be shown immediately.
 * (Files in a route folder that aren't named page/layout/etc. are private —
 * they never become URLs.)
 */
export async function SchoolDetails({ params }: Pick<PageProps<"/schools/[slug]">, "params">) {
  const { slug } = await params;
  const [schoolResult, user, lessonLinks] = await Promise.all([
    getSchoolBySlug(slug),
    getCurrentUser(),
    getLessonLinksByModule(),
  ]);
  const school = schoolResult.data;

  // Unknown slug (e.g. a typo in the address bar) → show the 404 page.
  if (!school) notFound();

  // School pages are PUBLIC. Learner data is only loaded for a signed-in
  // learner; for everyone else the mastery panel invites them to sign in.
  const character = user ? await getCharacterSummary() : null;

  const courses = school.categories.flatMap((category) => category.courses);
  const lessons = courses.reduce((sum, course) => sum + plannedLessonCount(course), 0);
  const mastery = character?.data.mastery.find((m) => m.schoolSlug === school.slug);
  const attribute = ATTRIBUTES.find((a) => a.key === school.primaryAttribute);
  const source = character ? combineSources(schoolResult.source, character.source) : schoolResult.source;

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-slate-dim">
          <li>
            <Link href={routes.schools()} className="hover:text-gold-300">
              Schools
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="truncate text-mist">
            {school.shortName}
          </li>
        </ol>
      </nav>

      <header className="relative overflow-hidden rounded-3xl border border-gold-700/30 bg-gradient-to-br from-navy-700/70 via-navy-800/90 to-charcoal-900 p-6 sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-10 size-64 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-gold-600/40 bg-navy-900 text-gold-400">
            <SchoolIcon name={school.icon} className="size-8" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">{school.tagline}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{school.name}</h1>
            <p className="mt-3 max-w-2xl text-mist">{school.description}</p>
            <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div className="flex gap-1.5">
                <dt className="text-slate-dim">Categories</dt>
                <dd className="font-semibold text-parchment">{school.categories.length}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="text-slate-dim">Courses</dt>
                <dd className="font-semibold text-parchment">{courses.length}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="text-slate-dim">Lessons planned</dt>
                <dd className="font-semibold text-parchment">{lessons}</dd>
              </div>
              {attribute && (
                <div className="flex gap-1.5">
                  <dt className="text-slate-dim">Develops</dt>
                  <dd className="font-semibold text-gold-300">{attribute.label}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          {school.categories.map((category) => (
            <section key={category.id} aria-labelledby={`${category.id}-heading`}>
              <h2 id={`${category.id}-heading`} className="font-display text-2xl font-semibold">
                {category.title}
              </h2>
              <p className="mb-3 text-sm text-mist">{category.description}</p>
              <ul className="space-y-3">
                {category.courses.map((course) => (
                  <li key={course.id}>
                    <CourseAccordion course={course} lessonsByModule={lessonLinks.data} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="xl:sticky xl:top-10 xl:self-start">
          <Panel id="school-mastery" eyebrow="Your standing" title="School Mastery" action={<SampleDataNotice source={source} />}>
            {mastery && mastery.tier !== "Unranked" ? (
              <>
                <p className="font-display text-3xl font-semibold text-gold-300">{mastery.tier}</p>
                <p className="text-sm text-mist">
                  Rank {mastery.progress.level} · {formatNumber(mastery.xp)} XP earned here
                </p>
                {!mastery.progress.isMaxLevel && (
                  <>
                    <ProgressBar
                      className="mt-4"
                      value={mastery.progress.xpIntoLevel}
                      max={mastery.progress.xpSpanOfLevel}
                      label={`Progress to ${school.shortName} rank ${mastery.progress.level + 1}`}
                    />
                    <p className="mt-2 text-xs text-slate-dim">
                      {formatNumber(mastery.progress.xpToNextLevel)} XP to rank {mastery.progress.level + 1}
                    </p>
                  </>
                )}
              </>
            ) : user ? (
              <>
                <Badge tone="muted">Unranked</Badge>
                <p className="mt-3 text-sm text-mist">
                  You haven&apos;t earned XP in this school yet. Mastery ranks begin with your first completed lesson.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-mist">Sign in to track your mastery in this school as you complete lessons.</p>
                <ArrowLink href={routes.login(routes.school(school.slug))} className="mt-3">
                  Sign in
                </ArrowLink>
              </>
            )}
          </Panel>
        </aside>
      </div>

      <CourseHashOpener />
    </div>
  );
}

/** Grey placeholder shapes shown while SchoolDetails loads. */
export function SchoolDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="h-4 w-40 rounded bg-charcoal-800" />
      <div className="h-56 rounded-3xl bg-charcoal-900" />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-charcoal-900" />
          ))}
        </div>
        <div className="h-40 rounded-2xl bg-charcoal-900" />
      </div>
    </div>
  );
}
