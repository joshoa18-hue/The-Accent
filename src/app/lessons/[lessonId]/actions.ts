"use server";

import { updateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { LEARNER_DATA_TAG } from "@/lib/data/cache-tags";
import { getLessonPage, getQuizExplanations } from "@/lib/data/lessons";
import { parseCompletionResult, readQuizAnswers, type QuizAnswers, type Reward } from "@/lib/lessons/quiz";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type QuizState =
  | { status: "idle" }
  | { status: "error"; message: string; answers: QuizAnswers }
  | { status: "incomplete"; unanswered: string[]; answers: QuizAnswers }
  | { status: "retry"; wrong: string[]; answers: QuizAnswers }
  | {
      status: "passed";
      awarded: boolean;
      xp: number;
      /** Missions, objectives and achievements the database granted alongside this lesson. */
      rewards: Reward[];
      explanations: Record<string, string>;
      answers: QuizAnswers;
    };

/**
 * SERVER ACTION: submit a lesson's quiz.
 *
 * This action does NOT decide whether the answers are right or how much XP
 * to give. It cleans the input and asks the database, whose
 * complete_lesson(lesson, answers) checks the answer key, records the
 * completion and awards XP once. The browser can't skip that check: the
 * function reads the learner from their login and the XP from the lessons table.
 */
export async function submitQuiz(_previous: QuizState, formData: FormData): Promise<QuizState> {
  const lessonId = String(formData.get("lessonId") ?? "");
  const { data: page } = await getLessonPage(lessonId);
  if (!page) return { status: "error", message: "This lesson doesn't exist.", answers: {} };

  const { answers, unanswered } = readQuizAnswers(formData, page.quiz);

  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Your session has ended. Sign in again to submit your answers.", answers };
  }

  if (unanswered.length > 0) return { status: "incomplete", unanswered, answers };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("complete_lesson", { p_lesson_id: lessonId, p_answers: answers });
  if (error) {
    console.error("[quiz] complete_lesson failed:", error.code, error.message);
    return { status: "error", message: "Your answers couldn't be checked right now. Try again in a moment.", answers };
  }

  const result = parseCompletionResult(data);
  if (!result) {
    console.error("[quiz] unexpected complete_lesson result:", data);
    return { status: "error", message: "Something went wrong checking your answers. Try again.", answers };
  }

  if (!result.passed) return { status: "retry", wrong: result.wrong, answers };

  // Passed: XP and progress changed, so the next page must show fresh data.
  updateTag(LEARNER_DATA_TAG);
  return {
    status: "passed",
    awarded: result.awarded,
    xp: result.xp,
    rewards: result.rewards,
    explanations: await getQuizExplanations(lessonId),
    answers,
  };
}
