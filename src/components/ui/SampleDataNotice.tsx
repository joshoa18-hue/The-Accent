import { FlaskConical } from "lucide-react";
import type { DataSource } from "@/types/data";
import { Badge } from "./Badge";

/**
 * Shows a "Sample data" label whenever information did not come from the database.
 * The data layer reports where each result came from, so this label switches
 * itself off automatically once Supabase is connected.
 */
export function SampleDataNotice({ source }: { source: DataSource }) {
  if (source !== "sample") return null;

  return (
    <Badge tone="muted" className="whitespace-nowrap">
      <FlaskConical aria-hidden className="size-3" />
      <span>Sample data</span>
      <span className="sr-only">: this is placeholder information until the database is connected</span>
    </Badge>
  );
}
