import type { Lesson } from "@/types/lesson";

export const whatIsAnArgument: Lesson = {
  id: "strategy-critical-thinking-1-1",
  schoolSlug: "strategy-critical-thinking",
  courseId: "strategy-critical-thinking",
  moduleId: "strategy-critical-thinking-1",
  order: 1,
  title: "What Is an Argument?",
  summary: "In critical thinking, an argument isn’t a quarrel. It’s reasons offered in support of a conclusion.",
  minutes: 7,
  xpReward: 40,
  blocks: [
    {
      type: "paragraph",
      text: "In everyday speech an argument is a disagreement, often a heated one. In critical thinking the word has a precise and calmer meaning: an argument is a set of statements in which some (the premises) are offered as reasons to accept another (the conclusion).",
    },
    {
      type: "keyIdea",
      title: "The key idea",
      text: "An argument = premises + conclusion. Premises are the reasons; the conclusion is what they are meant to support.",
    },
    { type: "heading", text: "Arguments versus assertions" },
    {
      type: "paragraph",
      text: "“Cities should have more cycle lanes” is an assertion: a claim on its own. It becomes an argument only when reasons are given for it: “Cycle lanes make cycling safer, and safer cycling encourages more people to cycle, so cities should have more cycle lanes.” Being able to tell the difference matters, because a confident assertion can feel persuasive even when no reason has been offered at all.",
    },
    { type: "heading", text: "Spotting the parts" },
    {
      type: "paragraph",
      text: "Certain words often signal which part is which. They aren’t always present, but they’re useful clues.",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "Conclusion indicators: therefore, so, thus, hence, which means that, it follows that.",
        "Premise indicators: because, since, given that, for, as shown by.",
      ],
    },
    { type: "heading", text: "Writing it in standard form" },
    {
      type: "paragraph",
      text: "To examine an argument clearly, rewrite it as a numbered list: premises first, conclusion last. This strips away tone and style, so you can ask two separate questions: are the premises true, and do they actually support the conclusion?",
    },
    {
      type: "list",
      style: "number",
      items: [
        "Cycle lanes make cycling safer.",
        "When cycling is safer, more people choose to cycle.",
        "Therefore, adding cycle lanes will lead more people to cycle.",
      ],
    },
    {
      type: "quote",
      text: "He who knows only his own side of the case, knows little of that.",
      source: "John Stuart Mill, On Liberty (1859)",
    },
    {
      type: "reflection",
      prompt: "Find a short opinion piece or advert. What is its conclusion, and which premises, if any, does it actually give?",
    },
  ],
  quiz: [
    {
      id: "q1",
      prompt: "In critical thinking, what is an argument?",
      choices: [
        { id: "a", text: "A heated disagreement between people" },
        { id: "b", text: "Any strongly held opinion" },
        { id: "c", text: "Statements offered as reasons (premises) to support a conclusion" },
      ],
      correctChoiceId: "c",
      explanation: "An argument links premises to a conclusion; it isn’t about conflict or strength of feeling.",
    },
    {
      id: "q2",
      prompt: "In “The shop is closed, since its lights are off”, which part is the premise?",
      choices: [
        { id: "a", text: "Its lights are off." },
        { id: "b", text: "The shop is closed." },
        { id: "c", text: "There is no premise; it is only an assertion." },
      ],
      correctChoiceId: "a",
      explanation: "“Since” introduces the reason (the premise); “the shop is closed” is the conclusion.",
    },
    {
      id: "q3",
      prompt: "Why rewrite an argument in standard form?",
      choices: [
        { id: "a", text: "To make it sound more convincing" },
        { id: "b", text: "To separate the premises from the conclusion so each can be checked clearly" },
        { id: "c", text: "Because arguments are only valid when numbered" },
      ],
      correctChoiceId: "b",
      explanation: "Standard form strips away style so you can ask whether the premises are true and whether they support the conclusion.",
    },
  ],
};
