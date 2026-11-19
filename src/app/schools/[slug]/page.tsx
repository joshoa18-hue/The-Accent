import type { Metadata } from "next";
import { Suspense } from "react";
import { getSchoolBySlug, getSchoolSlugs } from "@/lib/data/schools";
import { SchoolDetails, SchoolDetailsSkeleton } from "./school-details";

/**
 * Pre-build one page per school at build time, e.g. /schools/music-creative-arts.
 * Next.js calls this once during `npm run build`.
 */
export async function generateStaticParams() {
  const slugs = await getSchoolSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/schools/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { data: school } = await getSchoolBySlug(slug);
  return { title: school?.name ?? "School not found" };
}

/**
 * SCHOOL PAGE — foundation version (Milestone 1, checkpoint 1).
 *
 * Note that this component is NOT async and does not await `params`.
 * With Partial Prefetching, every link to /schools/<anything> preloads one
 * shared "App Shell". Reading the URL here would tie that shell to a single
 * school, so the URL is read inside the Suspense boundary instead.
 */
export default function SchoolPage({ params }: PageProps<"/schools/[slug]">) {
  return (
    <Suspense fallback={<SchoolDetailsSkeleton />}>
      <SchoolDetails params={params} />
    </Suspense>
  );
}
