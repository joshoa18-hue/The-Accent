/**
 * Where a piece of data came from.
 * - "sample":   placeholder data written by hand (Milestone 1)
 * - "database": real data loaded from Supabase (Milestone 2 onwards)
 */
export type DataSource = "sample" | "database";

/**
 * Every data-layer function returns its data wrapped with its source.
 * Pages use `source` to show the "Sample data" label honestly.
 */
export interface DataResult<T> {
  data: T;
  source: DataSource;
}
