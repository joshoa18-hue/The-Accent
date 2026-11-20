// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonBlocks } from "./LessonBlocks";
import { QuizPreview } from "./QuizPreview";

describe("LessonBlocks", () => {
  it("draws each block type with the right element", () => {
    render(
      <LessonBlocks
        blocks={[
          { type: "heading", text: "A heading" },
          { type: "paragraph", text: "Some text." },
          { type: "list", style: "number", items: ["One", "Two"] },
          { type: "quote", text: "Words.", source: "Someone" },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "A heading" })).toBeInTheDocument();
    expect(screen.getByRole("list")).toHaveProperty("tagName", "OL");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Someone")).toBeInTheDocument();
  });

  it("shows HTML in lesson text as plain text, never as markup", () => {
    const { container } = render(
      <LessonBlocks blocks={[{ type: "paragraph", text: '<img src=x onerror="alert(1)">' }]} />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText('<img src=x onerror="alert(1)">')).toBeInTheDocument();
  });
});

describe("QuizPreview", () => {
  const questions = [{ id: "q1", prompt: "Question?", choices: [{ id: "a", text: "Answer A" }] }];

  it("lists the questions and choices", () => {
    render(<QuizPreview questions={questions} />);
    expect(screen.getByText("1. Question?")).toBeInTheDocument();
    expect(screen.getByText("Answer A")).toBeInTheDocument();
  });

  it("is display-only until answers can be checked: no buttons or inputs", () => {
    const { container } = render(<QuizPreview questions={questions} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.querySelector("input")).toBeNull();
  });
});
