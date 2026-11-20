import { describe, expect, it } from "vitest";
import { routes } from "@/lib/routes";
import { getCourseById, getSchoolBySlug, getSchools, getSchoolSlugs } from "./schools";
import { combineSources } from "./source";

describe("schools data layer", () => {
  it("returns all eight schools, labelled as catalogue content", async () => {
    const result = await getSchools();
    expect(result.data).toHaveLength(8);
    expect(result.source).toBe("catalogue");
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

describe("combineSources", () => {
  it("is 'sample' if any part is sample", () => {
    expect(combineSources("database", "sample")).toBe("sample");
    expect(combineSources("catalogue", "sample")).toBe("sample");
  });

  it("counts catalogue content and database rows as real", () => {
    expect(combineSources("database", "catalogue")).toBe("database");
    expect(combineSources("catalogue", "catalogue")).toBe("catalogue");
  });
});

describe("routes", () => {
  it("builds course links with an anchor", () => {
    expect(routes.course("music-creative-arts", "music-ear-training")).toBe(
      "/schools/music-creative-arts#course-music-ear-training",
    );
  });
});
