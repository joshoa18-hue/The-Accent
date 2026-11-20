import { describe, expect, it } from "vitest";
import {
  toAchievements,
  toDailyMissions,
  toProfile,
  toWeeklyObjectives,
  toXpTransaction,
  utcDay,
  utcWeekStart,
  type TaskTemplateRow,
  type XpRow,
} from "./mappers";

function template(overrides: Partial<TaskTemplateRow>): TaskTemplateRow {
  return {
    id: "t",
    kind: "daily",
    title: "Title",
    description: "Description",
    xp_reward: 10,
    target: 1,
    unit: "missions",
    school_slug: null,
    sort_order: 0,
    ...overrides,
  };
}

describe("toProfile", () => {
  it("renames database columns to the app's names", () => {
    expect(
      toProfile({ id: "u1", display_name: "Ada", title: "Initiate", created_at: "2026-11-20T10:00:00Z" }),
    ).toEqual({ id: "u1", displayName: "Ada", title: "Initiate", joinedAt: "2026-11-20T10:00:00Z" });
  });
});

describe("toXpTransaction", () => {
  const row: XpRow = {
    id: "x1",
    user_id: "u1",
    amount: 40,
    source_type: "lesson",
    source_id: "lesson-1",
    school_slug: "music-creative-arts",
    description: "A lesson",
    created_at: "2026-11-20T10:00:00Z",
  };

  it("keeps the amount, source and school", () => {
    expect(toXpTransaction(row)).toMatchObject({
      amount: 40,
      sourceType: "lesson",
      sourceId: "lesson-1",
      schoolSlug: "music-creative-arts",
    });
  });

  it("leaves schoolSlug undefined for XP earned outside a school", () => {
    expect(toXpTransaction({ ...row, school_slug: null }).schoolSlug).toBeUndefined();
  });

  it("does not leak the user id into the app's type", () => {
    expect(toXpTransaction(row)).not.toHaveProperty("user_id");
  });
});

describe("toDailyMissions", () => {
  const templates = [
    template({ id: "b", sort_order: 1 }),
    template({ id: "a", sort_order: 0 }),
    template({ id: "w", kind: "weekly" }),
  ];

  it("lists daily templates in order, not started by default", () => {
    expect(toDailyMissions(templates, []).map((m) => [m.id, m.status])).toEqual([
      ["a", "not_started"],
      ["b", "not_started"],
    ]);
  });

  it("uses the learner's status when they have one for today", () => {
    const missions = toDailyMissions(templates, [{ template_id: "b", progress: 1, status: "completed" }]);
    expect(missions.find((m) => m.id === "b")?.status).toBe("completed");
  });
});

describe("toWeeklyObjectives", () => {
  const weekly = [template({ id: "w", kind: "weekly", target: 5, unit: "sessions" })];

  it("starts at zero progress", () => {
    expect(toWeeklyObjectives(weekly, [])[0]).toMatchObject({ current: 0, target: 5, unit: "sessions" });
  });

  it("never shows more progress than the target", () => {
    const [objective] = toWeeklyObjectives(weekly, [{ template_id: "w", progress: 9, status: "completed" }]);
    expect(objective.current).toBe(5);
  });
});

describe("toAchievements", () => {
  const all = [
    { id: "second", title: "Second", description: "", sort_order: 1 },
    { id: "first", title: "First", description: "", sort_order: 0 },
  ];

  it("marks everything locked for a new learner", () => {
    expect(toAchievements(all, []).map((a) => a.status)).toEqual(["locked", "locked"]);
  });

  it("marks earned achievements with their date", () => {
    const [first] = toAchievements(all, [{ achievement_id: "first", earned_at: "2026-11-20T10:00:00Z" }]);
    expect(first).toMatchObject({ id: "first", status: "earned", earnedAt: "2026-11-20T10:00:00Z" });
  });
});

describe("UTC periods", () => {
  it("formats the day in UTC", () => {
    expect(utcDay(new Date("2026-11-20T23:59:59Z"))).toBe("2026-11-20");
  });

  it.each([
    ["Monday", "2026-11-16T08:00:00Z", "2026-11-16"],
    ["Friday", "2026-11-20T12:00:00Z", "2026-11-16"],
    ["Sunday night", "2026-11-22T23:00:00Z", "2026-11-16"],
    ["across a month", "2026-12-02T12:00:00Z", "2026-11-30"],
  ])("puts %s in the week starting on Monday", (_label, moment, monday) => {
    expect(utcWeekStart(new Date(moment))).toBe(monday);
  });
});
