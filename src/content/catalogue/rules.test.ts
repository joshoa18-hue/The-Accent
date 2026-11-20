import { describe, expect, it } from "vitest";
import { masteryTierForRank } from "@/lib/progression/attributes";
import { CHARACTER_CURVE, MASTERY_CURVE, getLevelProgress } from "@/lib/progression/levels";
import { SCHOLAR_MASTERY_RANK, catalogueAchievements } from "./achievements";
import { catalogueLessons } from "./lessons";
import { catalogueSchools } from "./schools";
import { catalogueTasks } from "./tasks";

const byId = (id: string) => catalogueAchievements.find((a) => a.id === id)!;

describe("catalogue tasks", () => {
  it("use unique ids and sensible numbers (matching the database CHECKs)", () => {
    expect(new Set(catalogueTasks.map((t) => t.id)).size).toBe(catalogueTasks.length);
    for (const task of catalogueTasks) {
      expect(task.target, task.id).toBeGreaterThanOrEqual(1);
      expect(task.xpReward, task.id).toBeGreaterThanOrEqual(1);
      expect(task.xpReward, task.id).toBeLessThanOrEqual(500);
    }
  });

  it("are achievable: a module-finishing task needs at least one fully written module", () => {
    const modules = catalogueSchools.flatMap((s) => s.categories.flatMap((c) => c.courses.flatMap((co) => co.modules)));
    const fullyWritten = modules.filter(
      (module) => catalogueLessons.filter((lesson) => lesson.moduleId === module.id).length >= module.plannedLessons,
    );
    if (catalogueTasks.some((task) => task.rule === "modules_completed")) {
      expect(fullyWritten.length).toBeGreaterThan(0);
    }
  });
});

describe("catalogue achievements", () => {
  it("keep the ids learners may already have earned", () => {
    expect(catalogueAchievements.map((a) => a.id)).toEqual([
      "first-step",
      "three-schools",
      "scholar-rank",
      "polymath",
      "thirty-days",
      "level-twenty-five",
    ]);
  });

  it("set Scholar's Rank exactly where the Scholar tier starts on screen", () => {
    const threshold = byId("scholar-rank").threshold;
    expect(masteryTierForRank(SCHOLAR_MASTERY_RANK, true)).toBe("Scholar");
    expect(masteryTierForRank(getLevelProgress(threshold, MASTERY_CURVE).level, true)).toBe("Scholar");
    expect(masteryTierForRank(getLevelProgress(threshold - 1, MASTERY_CURVE).level, true)).not.toBe("Scholar");
  });

  it("set The High Road exactly at character level 25", () => {
    const threshold = byId("level-twenty-five").threshold;
    expect(getLevelProgress(threshold, CHARACTER_CURVE).level).toBe(25);
    expect(getLevelProgress(threshold - 1, CHARACTER_CURVE).level).toBe(24);
  });

  it("can't ask for more schools than exist", () => {
    for (const achievement of catalogueAchievements) {
      if (achievement.rule === "schools_studied" || achievement.rule === "schools_with_xp") {
        expect(achievement.threshold, achievement.id).toBeLessThanOrEqual(catalogueSchools.length);
      }
    }
  });
});
