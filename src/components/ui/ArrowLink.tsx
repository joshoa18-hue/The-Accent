import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ArrowLinkProps = {
  href: string;
  children: ReactNode;
  /** "button" looks like a solid gold call-to-action; "text" is a quiet link. */
  variant?: "text" | "button";
  className?: string;
};

/**
 * A real navigation link with an arrow. Note: it is a link (<a>), not a
 * <button>. Links go somewhere; buttons do something. Using the right
 * element keeps keyboard and screen-reader behaviour correct.
 */
export function ArrowLink({ href, children, variant = "text", className }: ArrowLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200",
        variant === "text" && "text-gold-400 hover:text-gold-300",
        variant === "button" &&
          "rounded-xl bg-gold-500 px-4 py-2.5 font-semibold text-navy-950 shadow-lg shadow-gold-900/20 hover:bg-gold-400",
        className,
      )}
    >
      {children}
      <ArrowRight aria-hidden className="size-4 transition-transform duration-300 ease-ascent group-hover:translate-x-0.5" />
    </Link>
  );
}
