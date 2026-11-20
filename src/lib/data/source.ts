import type { DataSource } from "@/types/data";

/**
 * If ANY piece of a page came from sample data, the page as a whole is
 * labelled "sample". Real data can only be claimed when everything is real.
 * (Catalogue content and database rows both count as real.)
 */
export function combineSources(...sources: DataSource[]): DataSource {
  if (sources.includes("sample")) return "sample";
  return sources.includes("database") ? "database" : "catalogue";
}
