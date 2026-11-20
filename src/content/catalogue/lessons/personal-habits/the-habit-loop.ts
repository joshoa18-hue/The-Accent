import type { Lesson } from "@/types/lesson";

export const theHabitLoop: Lesson = {
  id: "personal-habits-course-1-2",
  schoolSlug: "personal-development-human-skills",
  courseId: "personal-habits-course",
  moduleId: "personal-habits-course-1",
  order: 2,
  title: "The Habit Loop: Cue, Routine, Reward",
  summary: "Every habit has three parts. Once you can see them, you can change them.",
  minutes: 7,
  xpReward: 40,
  blocks: [
    {
      type: "paragraph",
      text: "A useful way to look at any habit is as a loop with three parts. The idea was popularised by the journalist Charles Duhigg, drawing on research into how the brain learns routines.",
    },
    {
      type: "list",
      style: "number",
      items: [
        "The cue: the situation that starts the behaviour, such as a time, a place, a feeling, other people, or the action you just finished.",
        "The routine: the behaviour itself.",
        "The reward: what you get from it, which teaches your brain the loop is worth repeating.",
      ],
    },
    { type: "heading", text: "An example" },
    {
      type: "paragraph",
      text: "You sit down at your desk (cue), pick up your phone and scroll for ten minutes (routine), and feel a small hit of novelty and relief from boredom (reward). Repeat that enough times and sitting down at your desk starts to pull your hand towards your phone.",
    },
    {
      type: "keyIdea",
      title: "The key idea",
      text: "You rarely change a habit by fighting the routine head-on. Look for the cue that starts it and the reward that keeps it going.",
    },
    { type: "heading", text: "Finding the real reward" },
    {
      type: "paragraph",
      text: "The reward isn’t always what it seems. The scrolling habit above might really be about a short break, or about avoiding a difficult task. If the true reward is a break, a two-minute walk can satisfy the same need with a better routine.",
    },
    {
      type: "paragraph",
      text: "A simple experiment helps: when the urge appears, try a different routine and notice afterwards whether the urge has faded. If it has, you’ve found something that meets the same need.",
    },
    { type: "heading", text: "Using the loop to build good habits" },
    {
      type: "list",
      style: "bullet",
      items: [
        "Choose a clear, reliable cue, such as straight after your morning coffee.",
        "Keep the routine small enough that you’ll actually do it.",
        "Give yourself an immediate reward, even just ticking it off or a moment of satisfaction. Long-term benefits arrive too slowly to teach the brain on their own.",
      ],
    },
    {
      type: "reflection",
      prompt: "Pick one habit you’d like to change. What is its cue, and what reward might it really be giving you?",
    },
  ],
  quiz: [
    {
      id: "q1",
      prompt: "What are the three parts of the habit loop?",
      choices: [
        { id: "a", text: "Goal, plan, result" },
        { id: "b", text: "Cue, routine, reward" },
        { id: "c", text: "Motivation, effort, discipline" },
      ],
      correctChoiceId: "b",
      explanation: "A cue starts the behaviour, the routine is the behaviour, and the reward teaches the brain to repeat it.",
    },
    {
      id: "q2",
      prompt: "Why does the lesson suggest looking at the cue and reward rather than fighting the routine?",
      choices: [
        { id: "a", text: "Because routines can never change." },
        { id: "b", text: "Because rewards are bad for you." },
        { id: "c", text: "Because the cue starts the habit and the reward keeps it going, so they’re where change is easiest." },
      ],
      correctChoiceId: "c",
      explanation: "Changing the cue or meeting the same reward another way is usually easier than resisting with willpower alone.",
    },
    {
      id: "q3",
      prompt: "Why should a new habit come with an immediate reward?",
      choices: [
        { id: "a", text: "Long-term benefits arrive too slowly to teach the brain on their own." },
        { id: "b", text: "Rewards make the habit form in exactly 21 days." },
        { id: "c", text: "It isn’t necessary; habits never need rewards." },
      ],
      correctChoiceId: "a",
      explanation: "An immediate reward links the routine to a good feeling now, which is what the brain learns from.",
    },
  ],
};
