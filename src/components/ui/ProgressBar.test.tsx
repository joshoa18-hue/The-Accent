// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("is announced to screen readers with its label and percentage", () => {
    render(<ProgressBar value={340} max={800} label="Progress to level 9" />);
    const bar = screen.getByRole("progressbar", { name: "Progress to level 9" });
    expect(bar).toHaveAttribute("aria-valuenow", "340");
    expect(bar).toHaveAttribute("aria-valuemax", "800");
    expect(bar).toHaveAttribute("aria-valuetext", "43%");
  });

  it("keeps out-of-range values inside the bar", () => {
    render(<ProgressBar value={1200} max={800} label="Overfilled" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "100%");
  });

  it("does not divide by zero", () => {
    render(<ProgressBar value={5} max={0} label="Empty" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "100%");
  });
});
