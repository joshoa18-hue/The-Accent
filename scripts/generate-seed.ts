/** Writes supabase/seed.sql. Usage: npm run db:seed */
import { writeFileSync } from "node:fs";
import { buildSeedSql } from "./seed-sql.ts";

const target = new URL("../supabase/seed.sql", import.meta.url);
writeFileSync(target, buildSeedSql());
console.log("Wrote supabase/seed.sql");
