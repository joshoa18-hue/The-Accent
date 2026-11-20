import { ArrowLink } from "@/components/ui/ArrowLink";
import { getCurrentUser } from "@/lib/auth/session";
import { getLessonCompletions } from "@/lib/data/progress";
import { routes } from "@/lib/routes";
import type { PublicQuizQuestion } from "@/types/lesson";
import { QuizForm } from "./QuizForm";
import { QuizPreview } from "./QuizPreview";

type QuizSectionProps = { lessonId: string; questions: readonly PublicQuizQuestion[]; xpReward: number };

/**
 * Decides what the quiz looks like for this visitor:
 *  - signed out → the questions read-only, plus a sign-in link;
 *  - signed in  → the real form (and whether they've already completed it).
 * It reads the session, so the lesson page renders it inside <Suspense>.
 */
export async function QuizSection({ lessonId, questions, xpReward }: QuizSectionProps) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <QuizPreview
        questions={questions}
        footer={
          <>
            <p>Sign in to answer these questions and earn {xpReward} XP for this lesson.</p>
            <ArrowLink href={routes.login(routes.lesson(lessonId))} className="mt-2">
              Sign in
            </ArrowLink>
          </>
        }
      />
    );
  }

  const { data: completions } = await getLessonCompletions();
  const alreadyCompleted = completions.some((completion) => completion.lessonId === lessonId);
  return <QuizForm lessonId={lessonId} questions={questions} xpReward={xpReward} alreadyCompleted={alreadyCompleted} />;
}
