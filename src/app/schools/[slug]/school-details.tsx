import { notFound } from "next/navigation";
import { SchoolIcon } from "@/components/icons/AppIcons";
import { Card } from "@/components/ui/Card";
import { getSchoolBySlug } from "@/lib/data/schools";

/**
 * The part of the school page that depends on the URL.
 * It receives `params` as a Promise and awaits it HERE, inside the page's
 * <Suspense> boundary, so the rest of the page can be shown immediately.
 * (Files in a route folder that aren't named page/layout/etc. are private —
 * they never become URLs.)
 */
export async function SchoolDetails({ params }: Pick<PageProps<"/schools/[slug]">, "params">) {
  const { slug } = await params;
  const { data: school } = await getSchoolBySlug(slug);

  // Unknown slug (e.g. a typo in the address bar) → show the 404 page.
  if (!school) notFound();

  return (
    <div className="space-y-8">
      <header className="flex items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-gold-700/40 bg-navy-800 text-gold-400">
          <SchoolIcon name={school.icon} className="size-7" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">School</p>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{school.name}</h1>
          <p className="mt-2 max-w-2xl text-mist">{school.description}</p>
        </div>
      </header>

      <ul className="grid gap-4 md:grid-cols-3">
        {school.categories.map((category) => (
          <li key={category.id}>
            <Card className="h-full">
              <h2 className="font-display text-xl font-semibold">{category.title}</h2>
              <p className="mt-1 text-sm text-mist">{category.description}</p>
              <ul className="mt-3 space-y-1 text-sm text-parchment">
                {category.courses.map((course) => (
                  <li key={course.id}>{course.title}</li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Grey placeholder shapes shown while SchoolDetails loads. */
export function SchoolDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden>
      <div className="flex items-start gap-4">
        <div className="size-14 rounded-2xl bg-charcoal-800" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-16 rounded bg-charcoal-800" />
          <div className="h-8 w-2/3 rounded bg-charcoal-800" />
          <div className="h-4 w-full max-w-xl rounded bg-charcoal-800" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-charcoal-900" />
        ))}
      </div>
    </div>
  );
}
