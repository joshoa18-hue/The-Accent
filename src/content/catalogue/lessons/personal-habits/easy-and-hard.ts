import type { Lesson } from "@/types/lesson";

export const easyAndHard: Lesson = {
  id: "personal-habits-course-2-2",
  schoolSlug: "personal-development-human-skills",
  courseId: "personal-habits-course",
  moduleId: "personal-habits-course-2",
  order: 2,
  title: "Make Good Habits Easy and Bad Habits Hard",
  summary: "Small amounts of effort decide a surprising number of choices. Use that friction on purpose.",
  minutes: 7,
  xpReward: 40,
  blocks: [
    {
      type: "paragraph",
      text: "When two options are roughly equal, people tend to take the one that needs less effort. That tiny effort is called friction: the number of steps, decisions or seconds between you and the action. Friction is small, but it is applied every single time, which is why it shapes habits so strongly.",
    },
    {
      type: "keyIdea",
      title: "The key idea",
      text: "Remove friction from the habits you want and add friction to the habits you don’t. Even a few extra steps can be enough to break an automatic loop.",
    },
    { type: "heading", text: "Lowering friction for good habits" },
    {
      type: "list",
      style: "bullet",
      items: [
        "Prepare the night before: lay out your running clothes, or open tomorrow’s lesson in a browser tab.",
        "Reduce the steps: keep a notebook and pen together, so writing needs no searching.",
        "Decide in advance: a fixed time and place means there’s nothing to decide when the moment comes.",
      ],
    },
    { type: "heading", text: "Raising friction for unwanted habits" },
    {
      type: "list",
      style: "bullet",
      items: [
        "Add steps: log out of an app after each use, so opening it means typing a password.",
        "Add distance: charge your phone in another room overnight.",
        "Add a pause: delete an app from your home screen so you must search for it, which gives you a moment to ask whether you really want it.",
      ],
    },
    { type: "heading", text: "Why it works" },
    {
      type: "paragraph",
      text: "An automatic habit runs smoothly because nothing interrupts it. Extra friction creates an interruption, and an interruption is a moment where your deliberate, thinking self can step in. You’re not banning the behaviour, just giving yourself a chance to choose.",
    },
    {
      type: "paragraph",
      text: "Be careful not to overdo it with good habits too. If your plan for exercise needs a long drive, special equipment and perfect weather, the friction may defeat you on an ordinary day. Start with the easiest version you can keep.",
    },
    {
      type: "reflection",
      prompt: "Choose one habit to make easier and one to make harder. What single change of one or two steps could you make today for each?",
    },
  ],
  quiz: [
    {
      id: "q1",
      prompt: "In this lesson, what is “friction”?",
      choices: [
        { id: "a", text: "Arguments with people who don’t share your goals" },
        { id: "b", text: "Tiredness at the end of the day" },
        { id: "c", text: "The steps, decisions or time between you and an action" },
      ],
      correctChoiceId: "c",
      explanation: "Friction is the effort needed to start something: steps, decisions or seconds.",
    },
    {
      id: "q2",
      prompt: "Why can adding friction help break an unwanted habit?",
      choices: [
        { id: "a", text: "It interrupts the automatic loop, giving your deliberate self a chance to choose." },
        { id: "b", text: "It makes the behaviour illegal." },
        { id: "c", text: "It increases the reward of the habit." },
      ],
      correctChoiceId: "a",
      explanation: "An interruption is a moment where you can stop and decide, instead of running on autopilot.",
    },
    {
      id: "q3",
      prompt: "Which change LOWERS friction for a good habit?",
      choices: [
        { id: "a", text: "Logging out of a study app after every session" },
        { id: "b", text: "Laying out your exercise clothes the night before" },
        { id: "c", text: "Keeping your notebook in a different room from your pen" },
      ],
      correctChoiceId: "b",
      explanation: "Preparing in advance removes steps at the moment you need to start.",
    },
  ],
};
