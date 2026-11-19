// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Achievement } from "@/types/activity";
import { AchievementList } from "./AchievementList";

const achievements: Achievement[] = [
  { id: "locked", title: "Locked One", description: "Not yet", status: "locked" },
  { id: "old", title: "Older Win", description: "Earlier", status: "earned", earnedAt: "2026-10-01T00:00:00Z" },
  { id: "new", title: "Newer Win", description: "Later", status: "earned", earnedAt: "2026-11-01T00:00:00Z" },
];

function titles() {
  return screen.getAllByRole("listitem").map((item) => item.querySelector("p")?.textContent);
}

describe("AchievementList", () => {
  it("shows earned achievements first, newest first, then locked ones", () => {
    render(<AchievementList achievements={achievements} />);
    expect(titles()).toEqual(["Newer Win (earned)", "Older Win (earned)", "Locked One (locked)"]);
  });

  it("respects the limit", () => {
    render(<AchievementList achievements={achievements} limit={1} />);
    expect(titles()).toEqual(["Newer Win (earned)"]);
  });

  it("shows the date an achievement was earned", () => {
    render(<AchievementList achievements={achievements} />);
    expect(screen.getByText(/Earned 1 Nov 2026/)).toBeInTheDocument();
  });
});
