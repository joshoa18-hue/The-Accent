import { describe, expect, it } from "vitest";
import { safeNextPath, signInCallbackUrl } from "./redirect";

describe("safeNextPath", () => {
  it("allows plain paths on this site, keeping query and hash", () => {
    expect(safeNextPath("/character")).toBe("/character");
    expect(safeNextPath("/schools/music-creative-arts#course-x")).toBe("/schools/music-creative-arts#course-x");
    expect(safeNextPath("/?tab=1")).toBe("/?tab=1");
  });

  it.each([
    ["full URL to another site", "https://evil.example"],
    ["protocol-relative URL", "//evil.example/path"],
    ["backslash trick", "/\\evil.example"],
    ["backslash later in the path", "/ok\\..\\evil"],
    ["javascript: URL", "javascript:alert(1)"],
    ["relative path", "character"],
    ["control character", "/char\u0000acter"],
    ["newline (header injection)", "/a\r\nSet-Cookie: x=1"],
    ["empty string", ""],
    ["not a string", 42],
    ["sign-in page loop", "/login?next=/login"],
    ["auth route", "/auth/confirm?token_hash=x"],
  ])("rejects %s", (_label, value) => {
    expect(safeNextPath(value)).toBe("/");
  });

  it("uses the fallback that was given", () => {
    expect(safeNextPath("https://evil.example", "/character")).toBe("/character");
  });

  it("refuses absurdly long values", () => {
    expect(safeNextPath("/" + "a".repeat(600))).toBe("/");
  });
});

describe("signInCallbackUrl", () => {
  it("points the email back at /auth/confirm on the same site", () => {
    expect(signInCallbackUrl("https://the-accent.vercel.app")).toBe("https://the-accent.vercel.app/auth/confirm");
    expect(signInCallbackUrl("http://localhost:3000")).toBe("http://localhost:3000/auth/confirm");
  });

  it.each([
    ["missing", null],
    ["empty", ""],
    ["not a URL", "not a url"],
    ["another protocol", "javascript:alert(1)"],
    ["a path smuggled in", "https://the-accent.vercel.app/evil"],
    ["credentials", "https://user:pass@the-accent.vercel.app"],
  ])("returns nothing for %s, so Supabase uses the Site URL", (_label, value) => {
    expect(signInCallbackUrl(value)).toBeUndefined();
  });
});
