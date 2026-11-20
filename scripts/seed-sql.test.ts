import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildSeedSql, sqlLiteral } from "./seed-sql";

describe("sqlLiteral", () => {
  it("escapes single quotes so text can't break out of the string", () => {
    expect(sqlLiteral("Today's '); drop table x; --")).toBe("'Today''s ''); drop table x; --'");
  });

  it("writes numbers, booleans and null as SQL", () => {
    expect(sqlLiteral(25)).toBe("25");
    expect(sqlLiteral(true)).toBe("true");
    expect(sqlLiteral(undefined)).toBe("null");
  });

  it("refuses values that should never be in the catalogue", () => {
    expect(() => sqlLiteral(1.5)).toThrow();
    expect(() => sqlLiteral("a\0b")).toThrow();
  });
});

describe("seed.sql", () => {
  it("is up to date with src/content (run `npm run db:seed` if this fails)", () => {
    const committed = readFileSync(new URL("../supabase/seed.sql", import.meta.url), "utf8");
    expect(committed).toBe(buildSeedSql());
  });

  it("contains all eight schools and no personal data", () => {
    const sql = buildSeedSql();
    expect(sql.match(/^  \('[a-z-]+', '[^']+', '/gm)?.length).toBeGreaterThanOrEqual(8);
    expect(sql).not.toMatch(/profiles|xp_transactions|auth\./);
  });
});
