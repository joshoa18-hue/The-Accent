import { describe, expect, it } from "vitest";
import { catalogueSchools } from "@/content/catalogue/schools";
import { buildLearningActivities, type ProgressLesson } from "./course-progress";

// The habits course plans 3 + 3 + 4 = 10 lessons; three are "written" here.
const lessons: ProgressLesson[] = [1, 2, 3].map((n) => ({
  id: `personal-habits-course-1-${n}`,
  title: `Lesson ${n}`,
  courseId: "personal-habits-course",
  moduleId: "personal-habits-course-1",
  schoolSlug: "personal-development-human-skills",
}));

describe("buildLearningActivities", () => {
  it("is empty for a learner who hasn't completed anything", () => {
    expect(buildLearningActivities([], lessons, catalogueSchools)).toEqual([]);
  });

  it("measures progress against every PLANNED lesson in the course", () => {
    const [activity] = buildLearningActivities(
      [{ lessonId: "personal-habits-course-1-1", completedAt: "2026-11-20T10:00:00Z" }],
      lessons,
      catalogueSchools,
    );
    expect(activity.progressPercent).toBe(10); // 1 of 10, not 1 of 3
    expect(activity.course.title).toBe("Building Lasting Habits");
    expect(activity.school.shortName).toBe("Personal Development");
  });

  it("points at the first lesson not yet completed, even after skipping ahead", () => {
    const [activity] = buildLearningActivities(
      [{ lessonId: "personal-habits-course-1-2", completedAt: "2026-11-20T10:00:00Z" }],
      lessons,
      catalogueSchools,
    );
    expect(activity.nextLesson).toEqual({ id: "personal-habits-course-1-1", title: "Lesson 1" });
    expect(activity.currentModuleTitle).toBe("How Habits Form");
  });

  it("has no next lesson once every written lesson is done", () => {
    const [activity] = buildLearningActivities(
      lessons.map((lesson, index) => ({ lessonId: lesson.id, completedAt: `2026-11-2${index}T10:00:00Z` })),
      lessons,
      catalogueSchools,
    );
    expect(activity.nextLesson).toBeUndefined();
    expect(activity.currentModuleTitle).toBe("More lessons coming soon");
    expect(activity.progressPercent).toBe(30);
    expect(activity.lastStudiedAt).toBe("2026-11-22T10:00:00Z");
  });

  it("ignores completions for lessons it doesn't know", () => {
    expect(
      buildLearningActivities([{ lessonId: "deleted-lesson", completedAt: "2026-11-20T10:00:00Z" }], lessons, catalogueSchools),
    ).toEqual([]);
  });
});
