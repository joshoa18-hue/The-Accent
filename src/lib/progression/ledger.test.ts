import { describe, expect, it } from "vitest";
import type { XpTransaction } from "@/types/progression";
import { sumXp, xpBySchool } from "./ledger";

/** Build a test transaction, overriding only the fields a test cares about. */
function makeTx(overrides: Partial<XpTransaction>): XpTransaction {
  return {
    id: "tx",
    amount: 0,
    sourceType: "lesson",
    sourceId: "lesson-1",
    description: "test",
    createdAt: "2026-11-01T00:00:00Z",
    ...overrides,
  };
}

describe("sumXp", () => {
  it("returns 0 for an empty ledger", () => {
    expect(sumXp([])).toBe(0);
  });

  it("adds awards and applies corrections", () => {
    const ledger = [
      makeTx({ id: "a", amount: 100 }),
      makeTx({ id: "b", amount: 50 }),
      makeTx({ id: "c", amount: -50, sourceType: "adjustment" }),
    ];
    expect(sumXp(ledger)).toBe(100);
  });

  it("never returns a negative total", () => {
    expect(sumXp([makeTx({ amount: -40, sourceType: "adjustment" })])).toBe(0);
  });

  it("refuses amounts that are not whole numbers", () => {
    expect(() => sumXp([makeTx({ id: "bad", amount: 12.5 })])).toThrow(/bad/);
    expect(() => sumXp([makeTx({ amount: Number.NaN })])).toThrow(TypeError);
  });
});

describe("xpBySchool", () => {
  it("groups XP by school and ignores XP earned outside a school", () => {
    const ledger = [
      makeTx({ amount: 100, schoolSlug: "technology-computers-ai" }),
      makeTx({ amount: 30, schoolSlug: "technology-computers-ai" }),
      makeTx({ amount: 20, schoolSlug: "music-creative-arts" }),
      makeTx({ amount: 25, sourceType: "mission" }),
    ];
    expect(xpBySchool(ledger)).toEqual({
      "technology-computers-ai": 130,
      "music-creative-arts": 20,
    });
  });
});
