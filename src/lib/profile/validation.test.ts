import { describe, expect, it } from "vitest";
import { checkProfile, cleanText } from "./validation";

describe("cleanText", () => {
  it("trims and squashes whitespace", () => {
    expect(cleanText("  Ada \n\t Lovelace  ")).toBe("Ada Lovelace");
  });

  it("removes invisible control and direction-override characters", () => {
    expect(cleanText("Ada\u0000​‮Lovelace")).toBe("AdaLovelace");
  });

  it("treats non-text as empty", () => {
    expect(cleanText(null)).toBe("");
    expect(cleanText(42)).toBe("");
  });
});

describe("checkProfile", () => {
  it("accepts a normal name and title, cleaned", () => {
    expect(checkProfile({ displayName: " Ada ", title: "Seeker of Wisdom" })).toEqual({
      ok: true,
      value: { displayName: "Ada", title: "Seeker of Wisdom" },
    });
  });

  it("keeps text that looks like code as plain text (React escapes it when shown)", () => {
    const result = checkProfile({ displayName: "<script>x</script>", title: "Title" });
    expect(result.ok).toBe(true);
  });

  it("rejects empty fields with a message for each", () => {
    const result = checkProfile({ displayName: "   ", title: "" });
    expect(result).toEqual({
      ok: false,
      errors: { displayName: "Enter a display name.", title: "Enter a title." },
    });
  });

  it("rejects text over 60 characters", () => {
    const result = checkProfile({ displayName: "a".repeat(61), title: "ok" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.displayName).toMatch(/60 characters/);
  });

  it("counts 60 characters as allowed", () => {
    expect(checkProfile({ displayName: "a".repeat(60), title: "ok" }).ok).toBe(true);
  });
});
