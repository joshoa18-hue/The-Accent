import { describe, expect, it } from "vitest";
import { routes } from "@/lib/routes";
import { getLearningActivities } from "./activity";
import { getCharacterSummary } from "./character";
import { getCourseById, getSchoolBySlug, getSchools, getSchoolSlugs } from "./schools";
import { combineSources } from "./source";

describe("schools data layer", () => {
  it("returns all eight schools, labelled as sample data", async () => {
    const result = await getSchools();
    expect(result.data).toHaveLength(8);
    expect(result.source).toBe("sample");
    expect(await getSchoolSlugs()).toHaveLength(8);
  });

  it("returns null for an unknown school instead of throwing", async () => {
    expect((await getSchoolBySlug("not-a-school")).data).toBeNull();
  });

  it("finds a course together with its school", async () => {
    const result = await getCourseById("tech-web-development");
    expect(result.data?.school.slug).toBe("technology-computers-ai");
    expect(result.data?.course.title).toBe("Modern Web Development");
    expect((await getCourseById("missing")).data).toBeNull();
  });
});

describe("activity data layer", () => {
  it("attaches course and school names and sorts newest first", async () => {
    const { data } = await getLearningActivities();
    expect(data.length).toBeGreaterThan(0);
    for (const activity of data) {
      expect(activity.course.title).toBeTruthy();
      expect(activity.school.name).toBeTruthy();
    }
    const dates = data.map((a) => a.lastStudiedAt);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});

describe("character data layer", () => {
  it("derives the sample character's level from the ledger", async () => {
    const { data } = await getCharacterSummary();
    expect(data.level.totalXp).toBe(3220);
    expect(data.level.level).toBe(8);
    expect(data.mastery).toHaveLength(8);
    expect(data.attributes).toHaveLength(6);
  });
});

describe("combineSources", () => {
  it("is 'sample' if any part is sample", () => {
    expect(combineSources("database", "sample")).toBe("sample");
    expect(combineSources("database", "database")).toBe("database");
  });
});

describe("routes", () => {
  it("builds course links with an anchor", () => {
    expect(routes.course("music-creative-arts", "music-ear-training")).toBe(
      "/schools/music-creative-arts#course-music-ear-training",
    );
  });
});
