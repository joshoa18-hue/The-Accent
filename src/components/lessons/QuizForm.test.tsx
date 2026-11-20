// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// The real Server Action talks to the database; the form's job is only to
// collect answers and show results, so a stand-in is enough here.
vi.mock("@/app/lessons/[lessonId]/actions", () => ({ submitQuiz: vi.fn() }));

const { QuizForm } = await import("./QuizForm");

const questions = [
  { id: "q1", prompt: "First question?", choices: [{ id: "a", text: "Alpha" }, { id: "b", text: "Beta" }] },
  { id: "q2", prompt: "Second question?", choices: [{ id: "a", text: "Gamma" }, { id: "b", text: "Delta" }] },
];

describe("QuizForm", () => {
  it("gives each question its own labelled group of radio buttons", () => {
    render(<QuizForm lessonId="l1" questions={questions} xpReward={40} alreadyCompleted={false} />);
    const group = screen.getByRole("group", { name: "1. First question?" });
    const radios = within(group).getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(radios[0]).toHaveAttribute("name", "answer:q1");
    expect(within(group).getByLabelText("Beta")).toHaveAttribute("value", "b");
  });

  it("has a real submit button that says what it's worth", () => {
    render(<QuizForm lessonId="l1" questions={questions} xpReward={40} alreadyCompleted={false} />);
    expect(screen.getByRole("button", { name: "Check answers (+40 XP)" })).toHaveAttribute("type", "submit");
  });

  it("tells a learner who already completed it that retaking won't award XP", () => {
    render(<QuizForm lessonId="l1" questions={questions} xpReward={40} alreadyCompleted />);
    expect(screen.getByText(/won.t award XP again/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check answers again" })).toBeInTheDocument();
  });

  it("never contains answer keys or explanations before submitting", () => {
    const { container } = render(<QuizForm lessonId="l1" questions={questions} xpReward={40} alreadyCompleted={false} />);
    expect(container.innerHTML).not.toMatch(/correct|explanation/i);
  });
});
