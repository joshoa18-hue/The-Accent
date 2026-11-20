import { describe, expect, it } from "vitest";
import { answerFieldName, parseCompletionResult, readQuizAnswers } from "./quiz";

const questions = [
  { id: "q1", prompt: "One?", choices: [{ id: "a", text: "A" }, { id: "b", text: "B" }] },
  { id: "q2", prompt: "Two?", choices: [{ id: "a", text: "A" }, { id: "c", text: "C" }] },
];

function form(entries: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

describe("readQuizAnswers", () => {
  it("reads one chosen answer per question", () => {
    const result = readQuizAnswers(form({ [answerFieldName("q1")]: "b", [answerFieldName("q2")]: "c" }), questions);
    expect(result).toEqual({ answers: { q1: "b", q2: "c" }, unanswered: [] });
  });

  it("lists questions that weren't answered", () => {
    expect(readQuizAnswers(form({ [answerFieldName("q1")]: "a" }), questions).unanswered).toEqual(["q2"]);
  });

  it("ignores choices that don't belong to the question, and unknown fields", () => {
    const result = readQuizAnswers(
      form({ [answerFieldName("q1")]: "z", [answerFieldName("q2")]: "b", "answer:q9": "a", other: "x" }),
      questions,
    );
    expect(result).toEqual({ answers: {}, unanswered: ["q1", "q2"] });
  });
});

describe("parseCompletionResult", () => {
  it("accepts the database's reply", () => {
    expect(parseCompletionResult({ passed: true, wrong: [], awarded: true, xp: 40 })).toEqual({
      passed: true,
      wrong: [],
      awarded: true,
      xp: 40,
    });
  });

  it.each([
    ["null", null],
    ["an array", []],
    ["missing fields", { passed: true }],
    ["negative XP", { passed: true, wrong: [], awarded: true, xp: -5 }],
    ["fractional XP", { passed: true, wrong: [], awarded: true, xp: 1.5 }],
    ["non-text question ids", { passed: false, wrong: [1], awarded: false, xp: 0 }],
  ])("rejects %s", (_label, value) => {
    expect(parseCompletionResult(value)).toBeNull();
  });
});
