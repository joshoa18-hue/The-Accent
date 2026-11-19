import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type CardProps = ComponentProps<"div"> & {
  /** Adds a hover lift for cards that are links. */
  interactive?: boolean;
};

/**
 * The basic surface used for every dashboard panel.
 * It accepts any normal <div> attribute (id, aria-label, ...) and passes it on.
 */
export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-charcoal-700/70 bg-charcoal-900/80 p-5 shadow-lg shadow-black/20 backdrop-blur-sm sm:p-6",
        interactive &&
          "transition duration-300 ease-ascent hover:-translate-y-0.5 hover:border-gold-600/50 hover:shadow-gold-900/10",
        className,
      )}
      {...props}
    />
  );
}
