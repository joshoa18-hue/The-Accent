import { describe, expect, it } from "vitest";
import { isPublishableKey, readSupabaseEnv } from "./env";

/** Builds a fake legacy JWT key whose payload claims the given role. */
function legacyKey(role: string): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256" })}.${encode({ role })}.signature`;
}

describe("isPublishableKey", () => {
  it("accepts publishable and legacy anon keys", () => {
    expect(isPublishableKey("sb_publishable_abc123")).toBe(true);
    expect(isPublishableKey(legacyKey("anon"))).toBe(true);
  });

  it("refuses secret and service-role keys", () => {
    expect(isPublishableKey("sb_secret_abc123")).toBe(false);
    expect(isPublishableKey(legacyKey("service_role"))).toBe(false);
    expect(isPublishableKey("random-string")).toBe(false);
  });
});

describe("readSupabaseEnv", () => {
  const good = { SUPABASE_URL: "http://127.0.0.1:55321", SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x" };

  it("returns the settings when they are valid", () => {
    expect(readSupabaseEnv(good)).toEqual({ url: good.SUPABASE_URL, publishableKey: "sb_publishable_x" });
  });

  it("explains what to do when settings are missing", () => {
    expect(() => readSupabaseEnv({})).toThrow(/\.env\.local/);
  });

  it("refuses a secret key even if someone pastes one in", () => {
    expect(() => readSupabaseEnv({ ...good, SUPABASE_PUBLISHABLE_KEY: "sb_secret_oops" })).toThrow(/never a secret/);
  });

  it("refuses a URL that isn't http(s)", () => {
    expect(() => readSupabaseEnv({ ...good, SUPABASE_URL: "ftp://example" })).toThrow();
  });
});
