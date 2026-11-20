/**
 * Every written lesson. Add a new lesson by writing its file and listing it
 * here; the integrity tests (lessons.test.ts) check it fits the catalogue, and
 * `npm run db:seed` copies its id, XP value and quiz answer key into the
 * database.
 *
 * Imports use the .ts extension because scripts/seed-sql.ts runs this file
 * directly with Node.
 */
import type { Lesson } from "@/types/lesson";
import { easyAndHard } from "./personal-habits/easy-and-hard.ts";
import { spacesAndFreshStarts } from "./personal-habits/spaces-and-fresh-starts.ts";
import { startSmall } from "./personal-habits/start-small.ts";
import { surroundingsShapeChoices } from "./personal-habits/surroundings-shape-choices.ts";
import { theHabitLoop } from "./personal-habits/the-habit-loop.ts";
import { whatAHabitIs } from "./personal-habits/what-a-habit-is.ts";
import { whatIsAnArgument } from "./strategy-critical-thinking/what-is-an-argument.ts";
import { whyBinary } from "./tech-how-computers-work/why-binary.ts";

export const catalogueLessons: readonly Lesson[] = [
  // Personal Development → Building Lasting Habits
  whatAHabitIs,
  theHabitLoop,
  startSmall,
  surroundingsShapeChoices,
  easyAndHard,
  spacesAndFreshStarts,
  // Strategy & Critical Thinking → Critical Thinking Essentials
  whatIsAnArgument,
  // Technology, Computers & AI → How Computers Work
  whyBinary,
];
