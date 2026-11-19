import { describe, expect, it } from "vitest";
import { sampleSchools } from "@/content/sample/schools";
import type { CharacterProfile, XpTransaction } from "@/types/progression";
import { buildCharacterSummary } from "./character";

const profile: CharacterProfile = {
  id: "test",
  displayName: "Tester",
  title: "Test Learner",
  joinedAt: "2026-01-01T00:00:00Z",
};

function lesson(id: string, amount: number, schoolSlug?: XpTransaction["schoolSlug"]): XpTransaction {
  return { id, amount, sourceType: "lesson", sourceId: id, schoolSlug, description: id, createdAt: "2026-11-01T00:00:00Z" };
}

describe("buildCharacterSummary", () => {
  it("gives a brand-new learner level 1 and unranked mastery everywhere", () => {
    const summary = buildCharacterSummary({ profile, transactions: [], schools: sampleSchools });
    expect(summary.level.level).toBe(1);
    expect(summary.level.totalXp).toBe(0);
    expect(summary.mastery).toHaveLength(8);
    expect(summary.mastery.every((m) => m.tier === "Unranked")).toBe(true);
    expect(summary.attributes.every((a) => a.xp === 0)).toBe(true);
  });

  it("feeds school XP into the matching attribute", () => {
    const summary = buildCharacterSummary({
      profile,
      transactions: [
        lesson("a", 200, "faith-scripture-wisdom"), // wisdom
        lesson("b", 100, "history-culture-philosophy"), // also wisdom
        lesson("c", 150, "technology-computers-ai"), // intellect
        lesson("d", 50), // a mission-style award with no school: total only
      ],
      schools: sampleSchools,
    });

    const attribute = (key: string) => summary.attributes.find((a) => a.key === key)!;
    expect(attribute("wisdom").xp).toBe(300);
    expect(attribute("intellect").xp).toBe(150);
    expect(attribute("creativity").xp).toBe(0);
    expect(summary.level.totalXp).toBe(500);
  });

  it("names mastery tiers from school XP", () => {
    const summary = buildCharacterSummary({
      profile,
      transactions: [lesson("a", 950, "technology-computers-ai")],
      schools: sampleSchools,
    });
    const tech = summary.mastery.find((m) => m.schoolSlug === "technology-computers-ai")!;
    // Mastery curve: rank 6 starts at 900 XP, rank 7 at 1,260 XP.
    expect(tech.progress.level).toBe(6);
    expect(tech.tier).toBe("Scholar");
  });
});
