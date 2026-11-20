/**
 * Integrity checks for the sample data. Hand-written data is easy to get
 * subtly wrong (a misspelt course id, a duplicate id), so these tests catch
 * it before it reaches the screen. The same rules will become foreign keys
 * and unique constraints in the database.
 */
import { describe, expect, it } from "vitest";
import { sampleLearningActivities } from "./activity";
import { sampleTransactions } from "./character";
import { catalogueSchools } from "@/content/catalogue/schools";

const allCourses = catalogueSchools.flatMap((s) => s.categories.flatMap((c) => c.courses));

describe("sample schools", () => {
  it("contains exactly the eight academic schools", () => {
    expect(catalogueSchools).toHaveLength(8);
    expect(new Set(catalogueSchools.map((s) => s.slug)).size).toBe(8);
  });

  it("gives every school at least one category, course and module", () => {
    for (const school of catalogueSchools) {
      expect(school.categories.length, school.slug).toBeGreaterThan(0);
      for (const category of school.categories) {
        expect(category.courses.length, category.id).toBeGreaterThan(0);
        for (const course of category.courses) {
          expect(course.modules.length, course.id).toBeGreaterThan(0);
        }
      }
    }
  });

  it("never reuses a category, course or module id", () => {
    const ids = catalogueSchools.flatMap((s) =>
      s.categories.flatMap((c) => [c.id, ...c.courses.flatMap((co) => [co.id, ...co.modules.map((m) => m.id)])]),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("sample activity and ledger", () => {
  it("only refers to courses and schools that exist", () => {
    for (const activity of sampleLearningActivities) {
      const school = catalogueSchools.find((s) => s.slug === activity.schoolSlug);
      expect(school, activity.id).toBeDefined();
      const courseInSchool = school!.categories.some((c) => c.courses.some((co) => co.id === activity.courseId));
      expect(courseInSchool, activity.id).toBe(true);
    }
    expect(allCourses.length).toBeGreaterThan(0);
  });

  it("uses unique transaction ids", () => {
    const ids = sampleTransactions.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
