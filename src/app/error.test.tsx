// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorPage from "./error";

describe("ErrorPage", () => {
  it("offers a working Try again button and a way back to the dashboard", () => {
    const retry = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorPage error={new Error("boom")} retry={retry} />);

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "Go to the dashboard" })).toHaveAttribute("href", "/");
  });

  it("never shows the error's message, which could reveal internal details", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorPage error={new Error("relation private.secret_table does not exist")} retry={() => {}} />);
    expect(screen.queryByText(/secret_table/)).not.toBeInTheDocument();
  });

  it("shows the reference id so a problem can be matched to the server logs", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorPage error={Object.assign(new Error("hidden"), { digest: "abc123" })} retry={() => {}} />);
    expect(screen.getByText("Reference: abc123")).toBeInTheDocument();
  });
});
