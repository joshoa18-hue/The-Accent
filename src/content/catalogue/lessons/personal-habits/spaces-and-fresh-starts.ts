import type { Lesson } from "@/types/lesson";

export const spacesAndFreshStarts: Lesson = {
  id: "personal-habits-course-2-3",
  schoolSlug: "personal-development-human-skills",
  courseId: "personal-habits-course",
  moduleId: "personal-habits-course-2",
  order: 3,
  title: "One Place, One Purpose, and Fresh Starts",
  summary: "Give places a clear job, and use moments of change to begin new habits.",
  minutes: 7,
  xpReward: 40,
  blocks: [
    {
      type: "paragraph",
      text: "Places collect associations. If you work, eat, scroll and sleep in the same spot, that spot cues all four, and they compete. When a place has one main purpose, simply being there starts to point you towards that activity.",
    },
    { type: "heading", text: "One place, one purpose" },
    {
      type: "list",
      style: "bullet",
      items: [
        "Study or work at a particular table or chair, and do other things elsewhere when you can.",
        "Keep screens out of bed if you want bed to cue sleep.",
        "Short on space? Use a small signal to change the purpose: a lamp you switch on only for study, or a cloth you lay on the table.",
      ],
    },
    {
      type: "keyIdea",
      title: "The key idea",
      text: "When a place has one clear purpose, arriving there becomes a cue for that purpose.",
    },
    { type: "heading", text: "Your digital surroundings count too" },
    {
      type: "paragraph",
      text: "Your phone and computer are environments as well. Notifications are cues that someone else designed. Turning off the ones you don’t need, and keeping your home screen for tools you want to use, applies the same principles to the space you probably spend most time in.",
    },
    { type: "heading", text: "Fresh starts" },
    {
      type: "paragraph",
      text: "Because habits are tied to context, a change of context loosens them. Researchers studying habits have found that old routines are easier to disrupt, and new ones easier to begin, when life changes: moving home, starting a new job or course, or even the start of a new week or month. Psychologists sometimes describe this as a “window of opportunity”, because the old cues have gone and new ones haven’t yet settled.",
    },
    {
      type: "paragraph",
      text: "You can make use of this on purpose. When something changes, decide straight away which habits you want the new situation to cue, before the old ones find their way back.",
    },
    {
      type: "quote",
      text: "To every thing there is a season, and a time to every purpose under the heaven.",
      source: "Ecclesiastes 3:1 (King James Version)",
    },
    {
      type: "reflection",
      prompt: "Is a change coming up for you: a new week, term, job or room? Which one habit will you attach to it from the very first day?",
    },
  ],
  quiz: [
    {
      id: "q1",
      prompt: "Why does giving a place one main purpose help?",
      choices: [
        { id: "a", text: "Being there becomes a cue for that purpose, instead of for many competing activities." },
        { id: "b", text: "It makes the room tidier, which is the only thing that matters." },
        { id: "c", text: "It means you can never do anything else there." },
      ],
      correctChoiceId: "a",
      explanation: "A single, clear purpose makes the place itself a reliable cue.",
    },
    {
      id: "q2",
      prompt: "How does the lesson describe notifications?",
      choices: [
        { id: "a", text: "As rewards you should collect" },
        { id: "b", text: "As harmless background noise" },
        { id: "c", text: "As cues that someone else designed" },
      ],
      correctChoiceId: "c",
      explanation: "Notifications are prompts placed in your environment by an app’s designers.",
    },
    {
      id: "q3",
      prompt: "Why are moments of change a good time to start a new habit?",
      choices: [
        { id: "a", text: "Because you have more free time when things change" },
        { id: "b", text: "Because old cues have gone and new ones haven’t settled yet" },
        { id: "c", text: "Because habits only form during holidays" },
      ],
      correctChoiceId: "b",
      explanation: "Habits are tied to context; when the context changes, there’s a window to set up new cues.",
    },
  ],
};
