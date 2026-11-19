import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";

type PanelProps = {
  /** Unique id; links the <section> to its heading for screen readers. */
  id: string;
  title: string;
  eyebrow?: string;
  /** Optional content in the header's right corner, e.g. an ArrowLink. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * A titled dashboard section: a <section> landmark containing a Card.
 * Every dashboard panel uses this, so they all look and behave the same.
 */
export function Panel({ id, title, eyebrow, action, children, className }: PanelProps) {
  const headingId = `${id}-heading`;
  return (
    <section aria-labelledby={headingId} className={cn("min-w-0", className)}>
      <Card className="flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-500">
                {eyebrow}
              </p>
            )}
            <h2 id={headingId} className="font-display text-xl font-semibold text-parchment">
              {title}
            </h2>
          </div>
          {action && <div className="shrink-0 pt-1">{action}</div>}
        </div>
        <div className="flex-1">{children}</div>
      </Card>
    </section>
  );
}
