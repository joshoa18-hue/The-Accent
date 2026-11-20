import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy } from "./csp";

function directives(policy: string): Map<string, string[]> {
  return new Map(
    policy.split("; ").map((part) => {
      const [name, ...values] = part.split(" ");
      return [name, values];
    }),
  );
}

describe("buildContentSecurityPolicy", () => {
  const production = directives(buildContentSecurityPolicy({ isDev: false }));
  const development = directives(buildContentSecurityPolicy({ isDev: true }));

  it("only allows this site by default", () => {
    expect(production.get("default-src")).toEqual(["'self'"]);
  });

  it("blocks plugins, framing by other sites and base-tag hijacking", () => {
    expect(production.get("object-src")).toEqual(["'none'"]);
    expect(production.get("frame-ancestors")).toEqual(["'none'"]);
    expect(production.get("base-uri")).toEqual(["'self'"]);
    expect(production.get("form-action")).toEqual(["'self'"]);
  });

  it("never allows eval or WebSockets in production", () => {
    expect(production.get("script-src")).not.toContain("'unsafe-eval'");
    expect(production.get("connect-src")).toEqual(["'self'"]);
    expect(production.has("upgrade-insecure-requests")).toBe(true);
  });

  it("allows the dev server's eval and hot-reload socket only in development", () => {
    expect(development.get("script-src")).toContain("'unsafe-eval'");
    expect(development.get("connect-src")).toContain("ws:");
    expect(development.has("upgrade-insecure-requests")).toBe(false);
  });

  it("names no outside domains at all", () => {
    for (const values of production.values()) {
      for (const value of values) expect(value).not.toMatch(/https?:\/\//);
    }
  });
});
