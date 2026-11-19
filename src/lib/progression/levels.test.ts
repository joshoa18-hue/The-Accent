import { describe, expect, it } from "vitest";
import { CHARACTER_CURVE, getLevelProgress, levelForXp, xpRequiredForLevel } from "./levels";

const curve = CHARACTER_CURVE; // baseXp 100, maxLevel 100

describe("xpRequiredForLevel", () => {
  it("matches the documented table", () => {
    expect(xpRequiredForLevel(1, curve)).toBe(0);
    expect(xpRequiredForLevel(2, curve)).toBe(100);
    expect(xpRequiredForLevel(3, curve)).toBe(300);
    expect(xpRequiredForLevel(4, curve)).toBe(600);
    expect(xpRequiredForLevel(8, curve)).toBe(2800);
  });

  it("rejects levels that do not exist", () => {
    expect(() => xpRequiredForLevel(0, curve)).toThrow(RangeError);
    expect(() => xpRequiredForLevel(2.5, curve)).toThrow(RangeError);
  });
});

describe("levelForXp", () => {
  it("starts everyone at level 1", () => {
    expect(levelForXp(0, curve)).toBe(1);
    expect(levelForXp(99, curve)).toBe(1);
  });

  it("levels up exactly on the boundary", () => {
    expect(levelForXp(100, curve)).toBe(2);
    expect(levelForXp(299, curve)).toBe(2);
    expect(levelForXp(300, curve)).toBe(3);
  });

  it("treats negative or fractional XP safely", () => {
    expect(levelForXp(-500, curve)).toBe(1);
    expect(levelForXp(100.9, curve)).toBe(2);
  });

  it("never exceeds the maximum level", () => {
    expect(levelForXp(Number.MAX_SAFE_INTEGER, curve)).toBe(100);
  });

  it("agrees with xpRequiredForLevel for every level", () => {
    for (let level = 1; level <= curve.maxLevel; level++) {
      const xp = xpRequiredForLevel(level, curve);
      expect(levelForXp(xp, curve)).toBe(level);
      if (level > 1) expect(levelForXp(xp - 1, curve)).toBe(level - 1);
    }
  });
});

describe("getLevelProgress", () => {
  it("describes progress part-way through a level", () => {
    // Level 8 starts at 2,800 XP; level 9 starts at 3,600 XP.
    expect(getLevelProgress(3195, curve)).toEqual({
      level: 8,
      totalXp: 3195,
      currentLevelXp: 2800,
      nextLevelXp: 3600,
      xpIntoLevel: 395,
      xpSpanOfLevel: 800,
      xpToNextLevel: 405,
      progressPercent: 49,
      isMaxLevel: false,
    });
  });

  it("reports a full bar at the maximum level", () => {
    const progress = getLevelProgress(10_000_000, curve);
    expect(progress.isMaxLevel).toBe(true);
    expect(progress.nextLevelXp).toBeNull();
    expect(progress.progressPercent).toBe(100);
    expect(progress.xpToNextLevel).toBe(0);
  });
});
