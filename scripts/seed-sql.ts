/**
 * Builds supabase/seed.sql from the TypeScript catalogue, so the curriculum
 * has ONE source of truth: the files in src/content/.
 *
 * Run with `npm run db:seed` (which calls generate-seed.ts). A test checks the
 * committed seed.sql is up to date, so the two can never silently drift.
 *
 * Imports are relative with a .ts extension because Node runs this file
 * directly (Node 24 strips the types); it does not understand the "@/" alias.
 */
import { catalogueSchools } from "../src/content/catalogue/schools.ts";
import {
  sampleAchievements,
  sampleDailyMissions,
  sampleWeeklyObjectives,
} from "../src/content/sample/activity.ts";

type SqlValue = string | number | boolean | null | undefined;

/** Turn a JS value into a safe SQL literal. Strings double their quotes. */
export function sqlLiteral(value: SqlValue): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number") {
    if (!Number.isInteger(value)) throw new TypeError(`Expected a whole number, got ${value}`);
    return String(value);
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value.includes("\0")) throw new TypeError("Strings may not contain NUL characters");
  return `'${value.replaceAll("'", "''")}'`;
}

function insert(table: string, columns: string[], rows: SqlValue[][]): string {
  if (rows.length === 0) return "";
  const values = rows.map((row) => `  (${row.map(sqlLiteral).join(", ")})`).join(",\n");
  return `insert into public.${table} (${columns.join(", ")}) values\n${values};\n`;
}

export function buildSeedSql(): string {
  const schools: SqlValue[][] = [];
  const categories: SqlValue[][] = [];
  const courses: SqlValue[][] = [];
  const modules: SqlValue[][] = [];

  catalogueSchools.forEach((school, schoolIndex) => {
    schools.push([
      school.slug, school.name, school.shortName, school.tagline,
      school.description, school.icon, school.primaryAttribute, schoolIndex,
    ]);
    school.categories.forEach((category, categoryIndex) => {
      categories.push([category.id, school.slug, category.title, category.description, categoryIndex]);
      category.courses.forEach((course, courseIndex) => {
        courses.push([course.id, category.id, course.title, course.summary, course.level, course.status, courseIndex]);
        course.modules.forEach((module, moduleIndex) => {
          modules.push([module.id, course.id, module.title, module.plannedLessons, moduleIndex]);
        });
      });
    });
  });

  const achievements = sampleAchievements.map((a, i): SqlValue[] => [a.id, a.title, a.description, 0, i]);

  const templates: SqlValue[][] = [
    ...sampleDailyMissions.map((m, i): SqlValue[] => [
      m.id, "daily", m.title, m.description, m.xpReward, 1, "missions", m.schoolSlug, i,
    ]),
    ...sampleWeeklyObjectives.map((o, i): SqlValue[] => [
      o.id, "weekly", o.title, "", o.xpReward, o.target, o.unit, null, i,
    ]),
  ];

  return [
    "-- =============================================================================",
    "-- GENERATED FILE: do not edit by hand.",
    "-- Source: src/content/ · Regenerate with `npm run db:seed`.",
    "-- Loaded automatically by `supabase db reset` (see supabase/config.toml).",
    "-- Contains catalogue rows only: no users and no personal data.",
    "-- =============================================================================",
    "",
    insert("schools", ["slug", "name", "short_name", "tagline", "description", "icon", "primary_attribute", "sort_order"], schools),
    insert("course_categories", ["id", "school_slug", "title", "description", "sort_order"], categories),
    insert("courses", ["id", "category_id", "title", "summary", "level", "status", "sort_order"], courses),
    insert("course_modules", ["id", "course_id", "title", "planned_lessons", "sort_order"], modules),
    insert("achievements", ["id", "title", "description", "xp_reward", "sort_order"], achievements),
    insert("task_templates", ["id", "kind", "title", "description", "xp_reward", "target", "unit", "school_slug", "sort_order"], templates),
  ].join("\n");
}
