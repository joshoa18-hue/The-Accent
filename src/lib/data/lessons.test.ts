import { describe, expect, it, vi } from "vitest";

// `server-only` throws when imported outside a React Server environment;
// in unit tests we only need to know the module is pure.
vi.mock("server-only", () => ({}));

const { getLessonLinksByModule, getLessonPage, toPublicQuiz } = await import("./lessons");

describe("toPublicQuiz", () => {
  it("removes the answer and explanation from every question", () => {
    const [question] = toPublicQuiz([
      {
        id: "q1",
        prompt: "Prompt",
        choices: [{ id: "a", text: "A" }],
        correctChoiceId: "a",
        explanation: "Because",
      },
    ]);
    expect(question).toEqual({ id: "q1", prompt: "Prompt", choices: [{ id: "a", text: "A" }] });
    expect(JSON.stringify(question)).not.toMatch(/correct|explanation|Because/);
  });
});

describe("getLessonPage", () => {
  it("returns a lesson with its school, course, module and neighbours", async () => {
    const { data } = await getLessonPage("personal-habits-course-1-2");
    expect(data?.lesson.title).toBe("The Habit Loop: Cue, Routine, Reward");
    expect(data?.school.slug).toBe("personal-development-human-skills");
    expect(data?.course.id).toBe("personal-habits-course");
    expect(data?.moduleNumber).toBe(1);
    expect(data?.previous?.id).toBe("personal-habits-course-1-1");
    expect(data?.next?.id).toBe("personal-habits-course-1-3");
  });

  it("has no previous lesson at the start of a course", async () => {
    const { data } = await getLessonPage("personal-habits-course-1-1");
    expect(data?.previous).toBeNull();
  });

  it("never includes quiz answers in what the page receives", async () => {
    const { data } = await getLessonPage("personal-habits-course-1-1");
    expect(data?.quiz.length).toBeGreaterThan(0);
    expect(JSON.stringify(data)).not.toMatch(/correctChoiceId|explanation/);
  });

  it("returns null for an unknown lesson", async () => {
    expect((await getLessonPage("no-such-lesson")).data).toBeNull();
  });
});

describe("getLessonLinksByModule", () => {
  it("groups lessons by module, in order", async () => {
    const { data, source } = await getLessonLinksByModule();
    expect(source).toBe("catalogue");
    expect(data["personal-habits-course-1"].map((link) => link.order)).toEqual([1, 2, 3]);
  });
});
