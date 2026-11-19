import type { DataSource } from "@/types/data";

/**
 * If ANY piece of a page came from sample data, the page as a whole is
 * labelled "sample". Real data can only be claimed when everything is real.
 */
export function combineSources(...sources: DataSource[]): DataSource {
  return sources.includes("sample") ? "sample" : "database";
}
