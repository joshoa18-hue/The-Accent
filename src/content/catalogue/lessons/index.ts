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
import { startSmall } from "./personal-habits/start-small.ts";
import { theHabitLoop } from "./personal-habits/the-habit-loop.ts";
import { whatAHabitIs } from "./personal-habits/what-a-habit-is.ts";

export const catalogueLessons: readonly Lesson[] = [whatAHabitIs, theHabitLoop, startSmall];
