import type { Lesson } from "@/types/lesson";

export const whatAHabitIs: Lesson = {
  id: "personal-habits-course-1-1",
  schoolSlug: "personal-development-human-skills",
  courseId: "personal-habits-course",
  moduleId: "personal-habits-course-1",
  order: 1,
  title: "What a Habit Really Is",
  summary: "Habits are behaviours your brain has learned to run automatically in a familiar situation.",
  minutes: 6,
  xpReward: 40,
  blocks: [
    {
      type: "paragraph",
      text: "Most people think of a habit as something you do often. That’s close, but it misses the important part. A habit is a behaviour that has become automatic: a familiar situation triggers it, and you start doing it without deciding to.",
    },
    {
      type: "paragraph",
      text: "Think about brushing your teeth. You don’t weigh up the pros and cons each night. You walk into the bathroom, see the toothbrush, and your hands simply begin. The decision was made long ago; now the situation makes it for you.",
    },
    { type: "heading", text: "Why your brain builds habits" },
    {
      type: "paragraph",
      text: "Deliberate decisions are slow and tiring. When you repeat the same action in the same situation, your brain gradually links the two, so the situation alone is enough to start the action. This frees your attention for things that genuinely need thought.",
    },
    {
      type: "paragraph",
      text: "Researchers who asked people to record what they were doing throughout the day found that roughly four in ten daily actions were performed in the same place almost every day, often while the person was thinking about something else (Wood, Quinn and Kashy, 2002). A large part of your life is running on habit, for better or worse.",
    },
    {
      type: "keyIdea",
      title: "The key idea",
      text: "A habit is a link between a situation and an action. Repetition in a stable situation strengthens that link until the action starts on its own.",
    },
    { type: "heading", text: "How long does it take?" },
    {
      type: "paragraph",
      text: "You may have heard that a habit takes 21 days to form. There is no good evidence for that number. In a study that followed people adopting a new daily behaviour, such as drinking water after breakfast, the time for the behaviour to feel automatic ranged from 18 to 254 days, with a middle value of about 66 days (Lally and colleagues, 2010).",
    },
    {
      type: "paragraph",
      text: "The same study found that missing a single day did not undo progress. What mattered was returning to the behaviour, in the same situation, again and again.",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "Habits form through repetition, not through willpower alone.",
        "A stable situation (same time, place or preceding action) speeds things up.",
        "Expect weeks or months, not days, and don’t panic over a missed day.",
      ],
    },
    {
      type: "quote",
      text: "Every habit and faculty is maintained and increased by the corresponding actions: the habit of walking by walking, the habit of running by running.",
      source: "Epictetus, Discourses II.18 (trans. George Long)",
    },
    {
      type: "reflection",
      prompt: "Name one thing you did today without deciding to. What situation started it?",
    },
  ],
  quiz: [
    {
      id: "q1",
      prompt: "What makes a behaviour a habit rather than just something you do often?",
      choices: [
        { id: "a", text: "You enjoy doing it." },
        { id: "b", text: "It starts automatically when you’re in a familiar situation." },
        { id: "c", text: "You have done it for exactly 21 days." },
      ],
      correctChoiceId: "b",
      explanation: "A habit is automatic: the situation triggers the action without a deliberate decision.",
    },
    {
      id: "q2",
      prompt: "In the study by Lally and colleagues, how long did new behaviours take to feel automatic?",
      choices: [
        { id: "a", text: "Always 21 days" },
        { id: "b", text: "About a week" },
        { id: "c", text: "Anywhere from 18 to 254 days, with a middle value of about 66" },
      ],
      correctChoiceId: "c",
      explanation: "The time varied widely between people and behaviours; the middle value was about 66 days.",
    },
    {
      id: "q3",
      prompt: "According to the same study, what happens if you miss a single day?",
      choices: [
        { id: "a", text: "It doesn’t undo your progress; returning to the behaviour is what matters." },
        { id: "b", text: "You have to start again from zero." },
        { id: "c", text: "The habit becomes stronger." },
      ],
      correctChoiceId: "a",
      explanation: "One missed day did not reset progress. Consistent return to the behaviour did the work.",
    },
  ],
};
