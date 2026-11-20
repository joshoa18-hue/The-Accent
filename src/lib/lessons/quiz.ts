/**
 * Pure helpers for the lesson quiz. No database, no cookies: easy to test.
 *
 * The database is the referee (complete_lesson checks the answers). These
 * functions only make sure we send it clean input and understand its reply.
 */
import type { PublicQuizQuestion } from "@/types/lesson";

/** question id → chosen choice id */
export type QuizAnswers = Record<string, string>;

/** The form field name for a question, e.g. "answer:q1". */
export function answerFieldName(questionId: string): string {
  return `answer:${questionId}`;
}

/**
 * Read the learner's answers from the submitted form.
 * Only real question ids and real choice ids for that question are kept, so
 * nothing unexpected is ever passed on to the database.
 */
export function readQuizAnswers(
  form: Pick<FormData, "get">,
  questions: readonly PublicQuizQuestion[],
): { answers: QuizAnswers; unanswered: string[] } {
  const answers: QuizAnswers = {};
  const unanswered: string[] = [];
  for (const question of questions) {
    const value = form.get(answerFieldName(question.id));
    if (typeof value === "string" && question.choices.some((choice) => choice.id === value)) {
      answers[question.id] = value;
    } else {
      unanswered.push(question.id);
    }
  }
  return { answers, unanswered };
}

/** What complete_lesson() returns. */
export type CompletionResult = {
  passed: boolean;
  wrong: string[];
  awarded: boolean;
  xp: number;
};

/** Check the database's reply has exactly the expected shape before trusting it. */
export function parseCompletionResult(value: unknown): CompletionResult | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const { passed, wrong, awarded, xp } = value as Record<string, unknown>;
  if (typeof passed !== "boolean" || typeof awarded !== "boolean") return null;
  if (typeof xp !== "number" || !Number.isInteger(xp) || xp < 0) return null;
  if (!Array.isArray(wrong) || !wrong.every((id) => typeof id === "string")) return null;
  return { passed, wrong, awarded, xp };
}
