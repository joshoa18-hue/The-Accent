import Link from "next/link";
import { cn } from "@/lib/utils";

/** The Ascent mark: a gold peak with a rising path. Pure SVG, no image file. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="9" className="fill-navy-800" />
      <path d="M5 24 L13.5 10 L18 17 L20.5 13.5 L27 24 Z" className="fill-gold-500/25" />
      <path
        d="M5 24 L13.5 10 L18 17 L20.5 13.5 L27 24"
        fill="none"
        className="stroke-gold-400"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="13.5" cy="10" r="1.6" className="fill-gold-300" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-semibold tracking-wide text-parchment">The Ascent</span>
        <span className="mt-1 text-[0.65rem] uppercase tracking-[0.25em] text-gold-500">Academy</span>
      </span>
    </Link>
  );
}
