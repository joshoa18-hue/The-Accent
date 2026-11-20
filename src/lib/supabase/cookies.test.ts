import { describe, expect, it } from "vitest";
import { sessionCookieOptions } from "./cookies";

describe("sessionCookieOptions", () => {
  it("keeps the login token away from page JavaScript", () => {
    expect(sessionCookieOptions.httpOnly).toBe(true);
  });

  it("isn't sent with cross-site form posts", () => {
    expect(sessionCookieOptions.sameSite).toBe("lax");
  });
});
