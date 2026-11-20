import type { Metadata } from "next";
import { Suspense } from "react";
import { getLessonIds, getLessonPage } from "@/lib/data/lessons";
import { LessonDetails, LessonDetailsSkeleton } from "./lesson-details";

/** Pre-build one page per written lesson at build time. */
export async function generateStaticParams() {
  const ids = await getLessonIds();
  return ids.map((lessonId) => ({ lessonId }));
}

export async function generateMetadata({ params }: PageProps<"/lessons/[lessonId]">): Promise<Metadata> {
  const { lessonId } = await params;
  const { data } = await getLessonPage(lessonId);
  return data ? { title: data.lesson.title, description: data.lesson.summary } : { title: "Lesson not found" };
}

/**
 * LESSON PAGE: public reading, one file for every lesson.
 * Like the school page, it reads the URL only inside <Suspense>, so the shared
 * page shell can be prefetched instantly.
 */
export default function LessonPage({ params }: PageProps<"/lessons/[lessonId]">) {
  return (
    <Suspense fallback={<LessonDetailsSkeleton />}>
      <LessonDetails params={params} />
    </Suspense>
  );
}
