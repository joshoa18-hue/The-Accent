/**
 * COMPILE-TIME CONTRACT between the database and the app.
 *
 * src/types/database.ts is generated from the real schema (`npm run db:types`).
 * The app's own types live in src/types/*.ts. If a migration adds, removes or
 * renames an enum value without the TypeScript union changing too (or the
 * other way round), `npm run typecheck` fails right here.
 *
 * This file has no runtime code; it only exists to be type-checked.
 */
import type { Database } from "./database";
import type { TaskStatus } from "./activity";
import type { AttributeKey, XpSourceType } from "./progression";
import type { CourseLevel, CourseStatus } from "./school";

type DbEnums = Database["public"]["Enums"];

/** `true` only when A and B are exactly the same type. */
type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

export type DatabaseEnumsMatchApp = [
  Equals<DbEnums["attribute_key"], AttributeKey>,
  Equals<DbEnums["xp_source_type"], XpSourceType>,
  Equals<DbEnums["course_level"], CourseLevel>,
  Equals<DbEnums["course_status"], CourseStatus>,
  Equals<DbEnums["task_status"], TaskStatus>,
];

// Fails to compile if any entry above is `false`.
export const databaseEnumsMatchApp: DatabaseEnumsMatchApp = [true, true, true, true, true];
