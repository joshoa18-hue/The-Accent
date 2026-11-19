/**
 * ⚠ SAMPLE DATA — Milestone 1
 * Missions, objectives, current courses and achievements for the dashboard.
 * Statuses here are display-only: nothing in the app changes them, and no
 * XP is awarded from the browser.
 */
import type { Achievement, DailyMission, LearningActivity, WeeklyObjective } from "@/types/activity";

export const sampleDailyMissions: DailyMission[] = [
  {
    id: "daily-focus",
    title: "Study for 25 focused minutes",
    description: "One uninterrupted session in any school.",
    xpReward: 25,
    status: "completed",
  },
  {
    id: "daily-review",
    title: "Review yesterday's notes",
    description: "Spaced review locks in what you learned.",
    xpReward: 15,
    status: "in_progress",
  },
  {
    id: "daily-proverbs",
    title: "Read one chapter of Proverbs",
    description: "A daily chapter of practical wisdom.",
    xpReward: 20,
    status: "not_started",
    schoolSlug: "faith-scripture-wisdom",
  },
  {
    id: "daily-writing",
    title: "Write a 150-word summary",
    description: "Explain one idea you learned today in your own words.",
    xpReward: 20,
    status: "not_started",
    schoolSlug: "languages-communication",
  },
];

export const sampleWeeklyObjectives: WeeklyObjective[] = [
  { id: "weekly-sessions", title: "Complete study sessions", current: 3, target: 5, unit: "sessions", xpReward: 100 },
  { id: "weekly-modules", title: "Finish course modules", current: 1, target: 2, unit: "modules", xpReward: 150 },
  { id: "weekly-schools", title: "Study across different schools", current: 2, target: 3, unit: "schools", xpReward: 80 },
];

export const sampleLearningActivities: LearningActivity[] = [
  {
    id: "activity-web",
    schoolSlug: "technology-computers-ai",
    courseId: "tech-web-development",
    currentModuleTitle: "TypeScript Fundamentals",
    progressPercent: 48,
    lastStudiedAt: "2026-11-16T18:00:00Z",
  },
  {
    id: "activity-habits",
    schoolSlug: "personal-development-human-skills",
    courseId: "personal-habits-course",
    currentModuleTitle: "Time and Energy Management",
    progressPercent: 72,
    lastStudiedAt: "2026-11-17T07:00:00Z",
  },
  {
    id: "activity-bible",
    schoolSlug: "faith-scripture-wisdom",
    courseId: "faith-bible-overview",
    currentModuleTitle: "Law, History and Covenant",
    progressPercent: 55,
    lastStudiedAt: "2026-11-11T07:30:00Z",
  },
  {
    id: "activity-thinking",
    schoolSlug: "strategy-critical-thinking",
    courseId: "strategy-critical-thinking",
    currentModuleTitle: "Common Fallacies",
    progressPercent: 38,
    lastStudiedAt: "2026-11-07T19:00:00Z",
  },
];

export const sampleAchievements: Achievement[] = [
  { id: "first-step", title: "First Step", description: "Complete your first lesson.", status: "earned", earnedAt: "2026-10-02T18:00:00Z" },
  { id: "three-schools", title: "Wide Horizons", description: "Study in three different schools.", status: "earned", earnedAt: "2026-10-08T07:00:00Z" },
  { id: "scholar-rank", title: "Scholar's Rank", description: "Reach Scholar mastery in any school.", status: "earned", earnedAt: "2026-11-16T18:00:00Z" },
  { id: "polymath", title: "Polymath", description: "Earn XP in all eight schools.", status: "locked" },
  { id: "thirty-days", title: "Steadfast", description: "Study on 30 days in a row.", status: "locked" },
  { id: "level-twenty-five", title: "The High Road", description: "Reach character level 25.", status: "locked" },
];
