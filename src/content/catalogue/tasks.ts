/**
 * Daily missions and weekly objectives. Real catalogue content: copied into
 * public.task_templates by `npm run db:seed`, and completed automatically by
 * the database when a learner's completed lessons meet the rule.
 *
 * Every task must be ACHIEVABLE with the lessons that exist (a test checks
 * modules_completed tasks have at least one fully written module).
 */
import type { TaskDefinition } from "@/types/rules";

export const catalogueTasks: readonly TaskDefinition[] = [
  {
    id: "daily-one-lesson",
    kind: "daily",
    title: "Complete a lesson",
    description: "Pass any lesson's quiz today.",
    rule: "lessons_completed",
    target: 1,
    unit: "lessons",
    xpReward: 20,
  },
  {
    id: "daily-two-lessons",
    kind: "daily",
    title: "Keep going: two lessons",
    description: "Pass two lessons' quizzes today.",
    rule: "lessons_completed",
    target: 2,
    unit: "lessons",
    xpReward: 30,
  },
  {
    id: "weekly-three-lessons",
    kind: "weekly",
    title: "Complete lessons",
    description: "Pass three lessons this week.",
    rule: "lessons_completed",
    target: 3,
    unit: "lessons",
    xpReward: 75,
  },
  {
    id: "weekly-one-module",
    kind: "weekly",
    title: "Finish a module",
    description: "Complete every lesson in a module this week.",
    rule: "modules_completed",
    target: 1,
    unit: "modules",
    xpReward: 100,
  },
];
