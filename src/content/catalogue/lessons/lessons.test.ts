/**
 * Integrity checks for written lessons. Lessons are hand-written data, so these
 * catch a misspelt module id, a duplicate id or a broken quiz before anything
 * reaches the screen or the database.
 */
import { describe, expect, it } from "vitest";
import { catalogueSchools } from "@/content/catalogue/schools";
import { catalogueLessons } from "./index";

const courses = catalogueSchools.flatMap((school) =>
  school.categories.flatMap((category) => category.courses.map((course) => ({ school, course }))),
);

describe("catalogue lessons", () => {
  it("never reuses a lesson id", () => {
    const ids = catalogueLessons.map((lesson) => lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("belong to a real module of a real, OPEN course in the right school", () => {
    for (const lesson of catalogueLessons) {
      const match = courses.find(({ course }) => course.id === lesson.courseId);
      expect(match, lesson.id).toBeDefined();
      expect(match!.school.slug, lesson.id).toBe(lesson.schoolSlug);
      expect(match!.course.status, lesson.id).toBe("open");
      expect(match!.course.modules.some((module) => module.id === lesson.moduleId), lesson.id).toBe(true);
    }
  });

  it("are numbered 1, 2, 3… within each module, and never exceed the planned count", () => {
    const byModule = Map.groupBy(catalogueLessons, (lesson) => lesson.moduleId);
    for (const [moduleId, lessons] of byModule) {
      const orders = lessons.map((lesson) => lesson.order).toSorted((a, b) => a - b);
      expect(orders, moduleId).toEqual(orders.map((_, index) => index + 1));
      const planned = courses
        .flatMap(({ course }) => course.modules)
        .find((module) => module.id === moduleId)!.plannedLessons;
      expect(lessons.length, moduleId).toBeLessThanOrEqual(planned);
    }
  });

  it("award a sensible amount of XP and have content", () => {
    for (const lesson of catalogueLessons) {
      expect(lesson.xpReward, lesson.id).toBeGreaterThanOrEqual(1);
      expect(lesson.xpReward, lesson.id).toBeLessThanOrEqual(1000); // matches the database CHECK
      expect(lesson.blocks.length, lesson.id).toBeGreaterThan(0);
      expect(lesson.title.trim(), lesson.id).not.toBe("");
    }
  });

  it("have a quiz of 2–5 questions whose answer is always one of the choices", () => {
    for (const lesson of catalogueLessons) {
      expect(lesson.quiz.length, lesson.id).toBeGreaterThanOrEqual(2);
      expect(lesson.quiz.length, lesson.id).toBeLessThanOrEqual(5);
      const questionIds = lesson.quiz.map((question) => question.id);
      expect(new Set(questionIds).size, lesson.id).toBe(questionIds.length);
      for (const question of lesson.quiz) {
        const choiceIds = question.choices.map((choice) => choice.id);
        expect(new Set(choiceIds).size, `${lesson.id} ${question.id}`).toBe(choiceIds.length);
        expect(choiceIds, `${lesson.id} ${question.id}`).toContain(question.correctChoiceId);
        expect(question.choices.length, `${lesson.id} ${question.id}`).toBeGreaterThanOrEqual(2);
        expect(question.explanation.trim(), `${lesson.id} ${question.id}`).not.toBe("");
      }
    }
  });

  it("don't put every correct answer in the same position (no 'always pick B')", () => {
    for (const lesson of catalogueLessons) {
      const positions = lesson.quiz.map((question) =>
        question.choices.findIndex((choice) => choice.id === question.correctChoiceId),
      );
      expect(new Set(positions).size, lesson.id).toBeGreaterThan(1);
    }
  });
});
