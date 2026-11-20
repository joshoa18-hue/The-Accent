import type { Lesson } from "@/types/lesson";

export const startSmall: Lesson = {
  id: "personal-habits-course-1-3",
  schoolSlug: "personal-development-human-skills",
  courseId: "personal-habits-course",
  moduleId: "personal-habits-course-1",
  order: 3,
  title: "Starting Small: Your First Habit Plan",
  summary: "Turn good intentions into a specific plan: when, where, and a version too small to skip.",
  minutes: 7,
  xpReward: 40,
  blocks: [
    {
      type: "paragraph",
      text: "Good intentions fail most often for a simple reason: they’re vague. “I’ll read more” doesn’t say when, where or how much, so every day it has to compete with everything else for a decision.",
    },
    { type: "heading", text: "Make an “if–then” plan" },
    {
      type: "paragraph",
      text: "Psychologists call a specific plan of the form “When situation X happens, I will do Y” an implementation intention. Across many studies, people who made plans like this were noticeably more likely to follow through than people who only set a goal (Gollwitzer and Sheeran, 2006).",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "Vague: “I’ll study more.”",
        "Specific: “When I finish breakfast on weekdays, I will open The Ascent and read one lesson at the kitchen table.”",
      ],
    },
    {
      type: "keyIdea",
      title: "The key idea",
      text: "A plan that names the situation turns a daily decision into a cue. The situation does the remembering for you.",
    },
    { type: "heading", text: "Make it too small to skip" },
    {
      type: "paragraph",
      text: "Early on, consistency matters more than size. Start with a version so small it feels almost silly: one page, two minutes, a single push-up. On good days you can do more; on hard days the tiny version keeps the link between cue and action alive.",
    },
    { type: "heading", text: "Attach it to something you already do" },
    {
      type: "paragraph",
      text: "Existing routines make excellent cues because they already happen reliably. Making coffee, arriving home or brushing your teeth can each anchor a new behaviour that follows straight after.",
    },
    {
      type: "list",
      style: "number",
      items: [
        "Choose one habit you want to build.",
        "Shrink it to a two-minute version.",
        "Pick an existing routine to follow.",
        "Write it down: “After I [existing routine], I will [two-minute version].”",
        "Do it today, and simply return to it if you miss a day.",
      ],
    },
    {
      type: "quote",
      text: "A journey of a thousand miles begins with a single step.",
      source: "Tao Te Ching, chapter 64 (traditional rendering)",
    },
    {
      type: "reflection",
      prompt: "Write your own plan: “After I ______, I will ______.” What is the two-minute version?",
    },
  ],
  quiz: [
    {
      id: "q1",
      prompt: "What is an implementation intention?",
      choices: [
        { id: "a", text: "A specific plan of the form “When situation X happens, I will do Y”" },
        { id: "b", text: "A general goal such as “I want to be healthier”" },
        { id: "c", text: "A promise to use more willpower" },
      ],
      correctChoiceId: "a",
      explanation: "It names the situation and the action, so the situation becomes the cue.",
    },
    {
      id: "q2",
      prompt: "Why start with a version of the habit that is very small?",
      choices: [
        { id: "a", text: "Small habits are the only ones that count." },
        { id: "b", text: "Early on, consistency builds the cue–action link more than size does." },
        { id: "c", text: "So that it takes exactly 66 days." },
      ],
      correctChoiceId: "b",
      explanation: "A version too small to skip keeps the habit going on hard days, and repetition is what forms it.",
    },
    {
      id: "q3",
      prompt: "Which of these is the best cue for a new habit?",
      choices: [
        { id: "a", text: "“Sometime in the evening”" },
        { id: "b", text: "“When I feel motivated”" },
        { id: "c", text: "“Straight after I make my morning coffee”" },
      ],
      correctChoiceId: "c",
      explanation: "An existing routine happens reliably, so it makes a dependable cue.",
    },
  ],
};
