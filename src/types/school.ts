import type { AttributeKey } from "./progression";

/**
 * The URL-friendly identifier of each of the eight academic schools.
 * A "union type" means TypeScript rejects any other string, so a typo
 * such as "tecnology-computers-ai" is caught before the app runs.
 */
export type SchoolSlug =
  | "faith-scripture-wisdom"
  | "technology-computers-ai"
  | "business-entrepreneurship-finance"
  | "strategy-critical-thinking"
  | "music-creative-arts"
  | "languages-communication"
  | "history-culture-philosophy"
  | "personal-development-human-skills";

/** Icon names are stored as plain strings so they can live in a database later. */
export type SchoolIconName =
  | "book-open"
  | "cpu"
  | "briefcase"
  | "brain"
  | "music"
  | "languages"
  | "landmark"
  | "sprout";

export type CourseLevel = "foundation" | "intermediate" | "advanced";

/**
 * "open":    the course structure is defined and will receive lessons first.
 * "planned": announced in the curriculum, content not written yet.
 */
export type CourseStatus = "open" | "planned";

/** A module groups lessons. Lessons themselves are added in a later milestone. */
export interface CourseModule {
  id: string;
  title: string;
  /** How many lessons are planned for this module. */
  plannedLessons: number;
}

export interface Course {
  id: string;
  title: string;
  summary: string;
  level: CourseLevel;
  status: CourseStatus;
  modules: CourseModule[];
}

export interface CourseCategory {
  id: string;
  title: string;
  description: string;
  courses: Course[];
}

export interface School {
  slug: SchoolSlug;
  /** Full name, e.g. "Technology, Computers & AI". */
  name: string;
  /** Short name for tight spaces such as the sidebar, e.g. "Technology & AI". */
  shortName: string;
  /** One-line motto shown on cards. */
  tagline: string;
  description: string;
  icon: SchoolIconName;
  /** The character attribute that grows when you study in this school. */
  primaryAttribute: AttributeKey;
  categories: CourseCategory[];
}
