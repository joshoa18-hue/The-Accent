import type { SchoolSlug } from "./school";

/**
 * LESSON CONTENT AS DATA
 *
 * A lesson is a list of typed "blocks" instead of free-form HTML. Each block
 * type has exactly one component that draws it, so:
 *  - every lesson looks consistent;
 *  - the type checker catches a missing field or a misspelt block type;
 *  - text is always rendered as text, so no lesson can inject HTML or scripts.
 */
export type LessonBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "keyIdea"; title: string; text: string }
  | { type: "quote"; text: string; source: string }
  | { type: "list"; style: "bullet" | "number"; items: string[] }
  | { type: "reflection"; prompt: string };

export type LessonBlockType = LessonBlock["type"];

export interface QuizChoice {
  id: string;
  text: string;
}

/**
 * One multiple-choice question. `correctChoiceId` and `explanation` are the
 * ANSWER KEY: they're copied into a locked database table and must never be
 * sent to the browser before the learner has answered.
 */
export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  explanation: string;
}

/** What the browser may see of a question: the answer key removed. */
export type PublicQuizQuestion = Omit<QuizQuestion, "correctChoiceId" | "explanation">;

export interface Lesson {
  /** e.g. "personal-habits-course-1-1": module id + lesson number. */
  id: string;
  schoolSlug: SchoolSlug;
  courseId: string;
  moduleId: string;
  /** Position within its module, starting at 1. */
  order: number;
  title: string;
  summary: string;
  /** Rough reading time. */
  minutes: number;
  /** XP awarded once, by the database, when the lesson is completed. */
  xpReward: number;
  blocks: LessonBlock[];
  quiz: QuizQuestion[];
}
