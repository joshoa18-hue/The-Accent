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

/** Something newly earned alongside a lesson: a mission, objective or achievement. */
export type Reward = { kind: "daily" | "weekly" | "achievement"; title: string; xp: number };

/** What complete_lesson() returns. */
export type CompletionResult = {
  passed: boolean;
  wrong: string[];
  awarded: boolean;
  xp: number;
  rewards: Reward[];
};

const rewardKinds = new Set<Reward["kind"]>(["daily", "weekly", "achievement"]);

function isWholeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function parseReward(value: unknown): Reward | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const { kind, title, xp } = value as Record<string, unknown>;
  if (typeof kind !== "string" || !rewardKinds.has(kind as Reward["kind"])) return null;
  if (typeof title !== "string" || title.length === 0 || !isWholeNumber(xp)) return null;
  return { kind: kind as Reward["kind"], title, xp };
}

/** Check the database's reply has exactly the expected shape before trusting it. */
export function parseCompletionResult(value: unknown): CompletionResult | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const { passed, wrong, awarded, xp, rewards } = value as Record<string, unknown>;
  if (typeof passed !== "boolean" || typeof awarded !== "boolean") return null;
  if (!isWholeNumber(xp)) return null;
  if (!Array.isArray(wrong) || !wrong.every((id) => typeof id === "string")) return null;
  if (!Array.isArray(rewards)) return null;
  const parsedRewards = rewards.map(parseReward);
  if (parsedRewards.some((reward) => reward === null)) return null;
  return { passed, wrong, awarded, xp, rewards: parsedRewards as Reward[] };
}
