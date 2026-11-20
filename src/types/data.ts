/**
 * Where a piece of data came from.
 * - "sample":    placeholder data written by hand. Pages using it show a label.
 * - "catalogue": real curriculum content kept in the codebase (src/content/catalogue/)
 * - "database":  real data loaded from Supabase for the signed-in learner
 */
export type DataSource = "sample" | "catalogue" | "database";

/**
 * Every data-layer function returns its data wrapped with its source.
 * Pages use `source` to show the "Sample data" label honestly.
 */
export interface DataResult<T> {
  data: T;
  source: DataSource;
}
