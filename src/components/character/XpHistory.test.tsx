// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { XpHistory } from "./XpHistory";

describe("XpHistory", () => {
  it("explains the empty ledger for a new learner instead of showing nothing", () => {
    render(<XpHistory transactions={[]} />);
    expect(screen.getByText(/No XP yet/)).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("shows corrections as negative amounts", () => {
    render(
      <XpHistory
        transactions={[
          {
            id: "1",
            amount: -25,
            sourceType: "adjustment",
            sourceId: "x",
            description: "Correction",
            createdAt: "2026-11-20T10:00:00Z",
          },
        ]}
      />,
    );
    expect(screen.getByText("Correction", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText(/-25|−25/)).toBeInTheDocument();
  });
});
