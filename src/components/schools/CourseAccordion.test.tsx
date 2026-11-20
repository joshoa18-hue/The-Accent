// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Course } from "@/types/school";
import { CourseAccordion, plannedLessonCount } from "./CourseAccordion";

const course: Course = {
  id: "test-course",
  title: "Test Course",
  summary: "A course used in tests.",
  level: "foundation",
  status: "open",
  modules: [
    { id: "m1", title: "First Module", plannedLessons: 3 },
    { id: "m2", title: "Second Module", plannedLessons: 4 },
  ],
};

describe("CourseAccordion lessons", () => {
  const lessonsByModule = {
    m1: [
      { id: "l1", title: "Lesson One", order: 1, minutes: 5 },
      { id: "l2", title: "Lesson Two", order: 2, minutes: 6 },
    ],
  };

  it("links each written lesson and counts them against the plan", () => {
    render(<CourseAccordion course={course} lessonsByModule={lessonsByModule} />);
    expect(screen.getByRole("link", { name: /1\. Lesson One/ })).toHaveAttribute("href", "/lessons/l1");
    expect(screen.getByText("2 of 3 lessons")).toBeInTheDocument();
  });

  it("marks completed lessons in words, not only with an icon", () => {
    render(<CourseAccordion course={course} lessonsByModule={lessonsByModule} completedLessonIds={["l2"]} />);
    // `hidden: true`: links inside a <details> element count as hidden in the
    // test environment's accessibility model, depending on its open state.
    const [one, two] = screen.getAllByRole("link", { hidden: true });
    expect(two).toHaveTextContent("2. Lesson Two (completed)");
    expect(one).not.toHaveTextContent("completed");
  });
});

describe("CourseAccordion", () => {
  it("starts closed and opens when its summary is clicked", () => {
    const { container } = render(<CourseAccordion course={course} />);
    const details = container.querySelector("details")!;
    expect(details).toHaveAttribute("id", "course-test-course");
    expect(details.open).toBe(false);

    fireEvent.click(screen.getByText("Test Course"));
    expect(details.open).toBe(true);
  });

  it("lists every module with its planned lessons", () => {
    render(<CourseAccordion course={course} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("First Module")).toBeInTheDocument();
    expect(screen.getByText("2 modules · 7 lessons planned")).toBeInTheDocument();
  });

  it("contains no buttons, because lessons are not available yet", () => {
    render(<CourseAccordion course={course} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("plannedLessonCount", () => {
  it("adds up lessons across modules", () => {
    expect(plannedLessonCount(course)).toBe(7);
  });
});
