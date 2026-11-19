import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: string;
  /** Small gold text shown above the title. */
  eyebrow?: string;
  description?: string;
  /** Optional content on the right, e.g. a link or a badge. */
  action?: ReactNode;
  /** Heading level. Use "h1" once per page, "h2" for sections. */
  as?: "h1" | "h2" | "h3";
  /** Lets a <section aria-labelledby="..."> point at this heading. */
  id?: string;
  className?: string;
};

export function SectionHeading({
  title,
  eyebrow,
  description,
  action,
  as: Heading = "h2",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
            {eyebrow}
          </p>
        )}
        <Heading
          id={id}
          className={cn(
            "font-display font-semibold text-parchment",
            Heading === "h1" ? "text-3xl sm:text-4xl" : "text-2xl",
          )}
        >
          {title}
        </Heading>
        {description && <p className="mt-1 max-w-2xl text-sm text-mist">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
