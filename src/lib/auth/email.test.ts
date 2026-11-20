import { describe, expect, it } from "vitest";
import { checkEmail } from "./email";

describe("checkEmail", () => {
  it("accepts a normal address, trimmed and lower-cased", () => {
    expect(checkEmail("  Learner@Example.COM ")).toEqual({ ok: true, email: "learner@example.com" });
  });

  it.each([
    ["empty", ""],
    ["spaces only", "   "],
    ["missing @", "learner.example.com"],
    ["missing domain dot", "learner@example"],
    ["contains a space", "lear ner@example.com"],
    ["not text", null],
    ["far too long", `${"a".repeat(250)}@example.com`],
  ])("rejects %s", (_label, value) => {
    expect(checkEmail(value).ok).toBe(false);
  });

  it("gives a message a person can act on", () => {
    const result = checkEmail("");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toBe("Enter your email address.");
  });
});
