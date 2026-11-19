// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CHARACTER_CURVE, getLevelProgress } from "@/lib/progression/levels";
import { LevelSummary } from "./LevelSummary";

describe("LevelSummary", () => {
  it("shows total XP and the distance to the next level", () => {
    render(<LevelSummary level={getLevelProgress(3220, CHARACTER_CURVE)} />);
    expect(screen.getByText("3,220 XP")).toBeInTheDocument();
    expect(screen.getByText(/380 XP to level 9/)).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Progress to level 9" })).toBeInTheDocument();
  });

  it("replaces the progress bar with a message at the maximum level", () => {
    render(<LevelSummary level={getLevelProgress(10_000_000, CHARACTER_CURVE)} />);
    expect(screen.getByText("Maximum level reached.")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
