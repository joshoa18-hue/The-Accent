/**
 * DATA LAYER: LESSONS (catalogue content)
 * ---------------------------------------
 * Written lessons live in src/content/catalogue/lessons/. They're public
 * reading, so these work for signed-out visitors and every lesson page is
 * prebuilt.
 *
 * `server-only`: the lesson files contain the quiz ANSWER KEYS. Importing this
 * module from browser code fails the build, and pages receive quizzes through
 * toPublicQuiz(), which strips the answers.
 */
import "server-only";
import { catalogueLessons } from "@/content/catalogue/lessons";
import { catalogueSchools } from "@/content/catalogue/schools";
import type { DataResult } from "@/types/data";
import type { Lesson, PublicQuizQuestion, QuizQuestion } from "@/types/lesson";
import type { Course, CourseModule, School } from "@/types/school";

/** A short reference to a lesson, for links and outlines. */
export type LessonLink = Pick<Lesson, "id" | "title" | "order" | "minutes">;

/** Everything a lesson page shows. Note: `quiz` has NO answers. */
export interface LessonPage {
  lesson: Omit<Lesson, "quiz">;
  quiz: PublicQuizQuestion[];
  school: School;
  course: Course;
  module: CourseModule;
  moduleNumber: number;
  previous: LessonLink | null;
  next: LessonLink | null;
}

/** Remove the answer key from every question. */
export function toPublicQuiz(quiz: readonly QuizQuestion[]): PublicQuizQuestion[] {
  return quiz.map(({ id, prompt, choices }) => ({ id, prompt, choices: choices.map(({ id: choiceId, text }) => ({ id: choiceId, text })) }));
}

function toLink(lesson: Lesson): LessonLink {
  return { id: lesson.id, title: lesson.title, order: lesson.order, minutes: lesson.minutes };
}

/** Lessons in reading order: by school, course and module as listed in the catalogue, then by number. */
function lessonsInOrder(): Lesson[] {
  const moduleOrder = catalogueSchools.flatMap((school) =>
    school.categories.flatMap((category) => category.courses.flatMap((course) => course.modules.map((module) => module.id))),
  );
  return catalogueLessons.toSorted(
    (a, b) => moduleOrder.indexOf(a.moduleId) - moduleOrder.indexOf(b.moduleId) || a.order - b.order,
  );
}

export async function getLessonIds(): Promise<string[]> {
  return catalogueLessons.map((lesson) => lesson.id);
}

/**
 * The explanation for each question of a lesson, by question id.
 * ONLY call this after the database has confirmed the learner passed: an
 * explanation gives the answer away.
 */
export async function getQuizExplanations(lessonId: string): Promise<Record<string, string>> {
  const lesson = catalogueLessons.find((candidate) => candidate.id === lessonId);
  return Object.fromEntries((lesson?.quiz ?? []).map((question) => [question.id, question.explanation]));
}

/** All written lessons as links with their course, for building course progress. */
export async function getAllLessonLinks(): Promise<(LessonLink & Pick<Lesson, "courseId" | "moduleId" | "schoolSlug">)[]> {
  return lessonsInOrder().map((lesson) => ({
    ...toLink(lesson),
    courseId: lesson.courseId,
    moduleId: lesson.moduleId,
    schoolSlug: lesson.schoolSlug,
  }));
}

/** Written lessons grouped by module id, for course outlines. */
export async function getLessonLinksByModule(): Promise<DataResult<Record<string, LessonLink[]>>> {
  const byModule: Record<string, LessonLink[]> = {};
  for (const lesson of lessonsInOrder()) {
    (byModule[lesson.moduleId] ??= []).push(toLink(lesson));
  }
  return { data: byModule, source: "catalogue" };
}

/** One lesson with its place in the catalogue, or `data: null` for an unknown id. */
export async function getLessonPage(lessonId: string): Promise<DataResult<LessonPage | null>> {
  const ordered = lessonsInOrder();
  const index = ordered.findIndex((lesson) => lesson.id === lessonId);
  if (index === -1) return { data: null, source: "catalogue" };

  const { quiz, ...lesson } = ordered[index];
  for (const school of catalogueSchools) {
    for (const category of school.categories) {
      const course = category.courses.find((c) => c.id === lesson.courseId);
      const moduleIndex = course?.modules.findIndex((m) => m.id === lesson.moduleId) ?? -1;
      if (course && moduleIndex !== -1) {
        // Previous/next stay within the same course.
        const sameCourse = (other: Lesson | undefined) => (other && other.courseId === lesson.courseId ? toLink(other) : null);
        return {
          data: {
            lesson,
            quiz: toPublicQuiz(quiz),
            school,
            course,
            module: course.modules[moduleIndex],
            moduleNumber: moduleIndex + 1,
            previous: sameCourse(ordered[index - 1]),
            next: sameCourse(ordered[index + 1]),
          },
          source: "catalogue",
        };
      }
    }
  }
  return { data: null, source: "catalogue" };
}
