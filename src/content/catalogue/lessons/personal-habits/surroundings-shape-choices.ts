import type { Lesson } from "@/types/lesson";

export const surroundingsShapeChoices: Lesson = {
  id: "personal-habits-course-2-1",
  schoolSlug: "personal-development-human-skills",
  courseId: "personal-habits-course",
  moduleId: "personal-habits-course-2",
  order: 1,
  title: "Your Surroundings Shape Your Choices",
  summary: "Much of what you do is prompted by what you see around you. Design that, and behaviour follows.",
  minutes: 6,
  xpReward: 40,
  blocks: [
    {
      type: "paragraph",
      text: "In the first module you saw that habits are triggered by cues: a time, a place, a feeling or a previous action. Many of the strongest cues are simply things in front of you. The biscuit tin on the counter, the guitar tucked away in a cupboard, the phone face-up beside your book: each one quietly suggests what to do next.",
    },
    {
      type: "paragraph",
      text: "This is good news. Willpower is unreliable, especially when you’re tired. Your surroundings, on the other hand, are there every day, working for you or against you whether you notice or not.",
    },
    {
      type: "keyIdea",
      title: "The key idea",
      text: "You don’t have to rely on resisting temptation in the moment. Arrange your surroundings so the behaviour you want is the obvious one.",
    },
    { type: "heading", text: "Choice architecture" },
    {
      type: "paragraph",
      text: "Economist Richard Thaler and legal scholar Cass Sunstein used the term “choice architecture” for the way options are arranged. What comes first, what is easiest to reach and what happens if you do nothing all shape what people choose, even though no option is forbidden. You are the choice architect of your own home, desk and phone.",
    },
    { type: "heading", text: "Make the cue visible" },
    {
      type: "list",
      style: "bullet",
      items: [
        "Want to read more? Leave the book on your pillow or chair, not on a shelf.",
        "Want to practise an instrument? Keep it out of its case, on a stand, where you pass it.",
        "Want to drink more water? Put a full bottle where you’ll see it first in the morning.",
      ],
    },
    { type: "heading", text: "Hide the cue you want less of" },
    {
      type: "paragraph",
      text: "The same principle works in reverse. A cue you can’t see is a cue that rarely fires. Moving the games console into a cupboard, logging out of a distracting app, or keeping snacks out of sight removes the prompt before the urge even starts.",
    },
    {
      type: "reflection",
      prompt: "Walk through the room you spend most time in. Which objects are prompting habits you want, and which are prompting habits you don’t?",
    },
  ],
  quiz: [
    {
      id: "q1",
      prompt: "Why is designing your surroundings often more reliable than relying on willpower?",
      choices: [
        { id: "a", text: "Because willpower doesn’t exist." },
        { id: "b", text: "Because your surroundings prompt you every day, while willpower is weakest when you’re tired." },
        { id: "c", text: "Because it removes every possible choice." },
      ],
      correctChoiceId: "b",
      explanation: "Surroundings keep working in the background every day; willpower varies and fades when you’re tired.",
    },
    {
      id: "q2",
      prompt: "What does “choice architecture” mean?",
      choices: [
        { id: "a", text: "The way options are arranged, which shapes what people choose without forbidding anything" },
        { id: "b", text: "Designing buildings for people with many choices" },
        { id: "c", text: "Banning the options you don’t want people to take" },
      ],
      correctChoiceId: "a",
      explanation: "Order, ease of reach and defaults all shape choices, even though nothing is forbidden.",
    },
    {
      id: "q3",
      prompt: "You want to play video games less in the evenings. Which change uses this lesson best?",
      choices: [
        { id: "a", text: "Promise yourself you’ll try harder." },
        { id: "b", text: "Leave the controller on the sofa as a reminder of your goal." },
        { id: "c", text: "Put the console away in a cupboard so it isn’t the first thing you see." },
      ],
      correctChoiceId: "c",
      explanation: "Hiding the cue stops it prompting the habit in the first place.",
    },
  ],
};
