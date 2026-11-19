/**
 * Join CSS class names, skipping empty values.
 *
 * cn("card", isActive && "card--active", undefined) → "card card--active"
 *
 * This saves installing a library (such as clsx) for a five-line function.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Format a whole number with thousands separators: 12450 → "12,450". */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Format an ISO date such as "2026-11-12T09:00:00Z" as "12 Nov 2026".
 * A fixed time zone makes the server and the browser print the same text,
 * which avoids React "hydration mismatch" warnings.
 */
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(isoDate));
}
