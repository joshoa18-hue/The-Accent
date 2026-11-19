// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DailyMission } from "@/types/activity";
import { DailyMissionList } from "./DailyMissionList";

const missions: DailyMission[] = [
  { id: "a", title: "Mission A", description: "Done", xpReward: 25, status: "completed" },
  { id: "b", title: "Mission B", description: "Started", xpReward: 15, status: "in_progress" },
  { id: "c", title: "Mission C", description: "Waiting", xpReward: 20, status: "not_started" },
];

describe("DailyMissionList", () => {
  it("summarises how many missions are complete", () => {
    render(<DailyMissionList missions={missions} />);
    expect(screen.getByText("1 of 3 completed today")).toBeInTheDocument();
  });

  it("announces each status in words, not only with an icon", () => {
    render(<DailyMissionList missions={missions} />);
    expect(screen.getByText(/Completed\./)).toBeInTheDocument();
    expect(screen.getByText(/In progress\./)).toBeInTheDocument();
    expect(screen.getByText(/Not started\./)).toBeInTheDocument();
  });

  it("is display-only: no buttons that could award XP", () => {
    render(<DailyMissionList missions={missions} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
