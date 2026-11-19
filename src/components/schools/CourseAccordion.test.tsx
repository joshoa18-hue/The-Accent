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
