import { describe, expect, it } from "vitest";
import { isActivePath } from "./navigation";

describe("isActivePath", () => {
  it("only highlights the dashboard on the dashboard", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/schools", "/")).toBe(false);
  });

  it("keeps a section highlighted on its child pages", () => {
    expect(isActivePath("/schools", "/schools")).toBe(true);
    expect(isActivePath("/schools/music-creative-arts", "/schools")).toBe(true);
  });

  it("does not confuse paths that merely start with the same letters", () => {
    expect(isActivePath("/schoolsabc", "/schools")).toBe(false);
  });

  it("supports exact matching for individual school links", () => {
    expect(isActivePath("/schools/music-creative-arts", "/schools/music-creative-arts", true)).toBe(true);
    expect(isActivePath("/schools", "/schools/music-creative-arts", true)).toBe(false);
  });
});
