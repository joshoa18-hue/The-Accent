import type { Lesson } from "@/types/lesson";

export const whyBinary: Lesson = {
  id: "tech-how-computers-work-1-1",
  schoolSlug: "technology-computers-ai",
  courseId: "tech-how-computers-work",
  moduleId: "tech-how-computers-work-1",
  order: 1,
  title: "Why Computers Count in Binary",
  summary: "Everything a computer stores, from photos to this sentence, comes down to long rows of 0s and 1s.",
  minutes: 8,
  xpReward: 40,
  blocks: [
    {
      type: "paragraph",
      text: "Inside a computer there are billions of tiny electronic switches called transistors. Each one is either on or off. That makes two states the most natural, reliable way for a machine to store information: on can stand for 1 and off for 0.",
    },
    {
      type: "paragraph",
      text: "Two states are also hard to confuse. If a circuit had to tell ten different voltage levels apart, small electrical disturbances could turn a 6 into a 7. Telling “clearly on” from “clearly off” is far more robust.",
    },
    {
      type: "keyIdea",
      title: "The key idea",
      text: "A single 0 or 1 is called a bit (short for “binary digit”). Computers represent everything as patterns of bits.",
    },
    { type: "heading", text: "Counting with only two digits" },
    {
      type: "paragraph",
      text: "We normally count in base 10: each place in a number is worth ten times the place to its right (ones, tens, hundreds…). Binary is base 2: each place is worth twice the place to its right.",
    },
    {
      type: "list",
      style: "bullet",
      items: [
        "Place values, from the right: 1, 2, 4, 8, 16, 32, 64, 128.",
        "101 in binary = 4 + 0 + 1 = 5.",
        "1010 in binary = 8 + 0 + 2 + 0 = 10.",
        "1111 in binary = 8 + 4 + 2 + 1 = 15.",
      ],
    },
    { type: "heading", text: "Bits and bytes" },
    {
      type: "paragraph",
      text: "Bits are usually handled in groups of eight, called a byte. With 8 bits there are 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 = 256 possible patterns, so one byte can represent any whole number from 0 to 255.",
    },
    {
      type: "paragraph",
      text: "Patterns of bits can stand for anything we agree on: numbers, letters (a code table maps each character to a number), colours in a photo (amounts of red, green and blue), or instructions for the processor. The bits don’t change; only the agreed meaning does.",
    },
    {
      type: "reflection",
      prompt: "Write your age in binary using the place values 32, 16, 8, 4, 2, 1. Which places did you need?",
    },
  ],
  quiz: [
    {
      id: "q1",
      prompt: "Why do computers use two states (0 and 1) rather than ten?",
      choices: [
        { id: "a", text: "Because the digits 2 to 9 hadn’t been invented when computers were made" },
        { id: "b", text: "Because transistors act as on/off switches, and two states are hard to confuse" },
        { id: "c", text: "Because binary uses less electricity than any other system in every case" },
      ],
      correctChoiceId: "b",
      explanation: "On/off switches map naturally to 1 and 0, and two clearly different states are robust against small disturbances.",
    },
    {
      id: "q2",
      prompt: "What number is 110 in binary?",
      choices: [
        { id: "a", text: "6" },
        { id: "b", text: "3" },
        { id: "c", text: "110" },
      ],
      correctChoiceId: "a",
      explanation: "110 = 4 + 2 + 0 = 6.",
    },
    {
      id: "q3",
      prompt: "How many different values can one byte (8 bits) represent?",
      choices: [
        { id: "a", text: "8" },
        { id: "b", text: "16" },
        { id: "c", text: "256" },
      ],
      correctChoiceId: "c",
      explanation: "Each of the 8 bits doubles the possibilities: 2⁸ = 256, so 0 to 255.",
    },
  ],
};
