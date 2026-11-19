import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants = {
  sidebar: {
    base: "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-200 ease-ascent",
    active: "bg-gold-500/10 text-gold-300 ring-1 ring-inset ring-gold-600/30",
    inactive: "text-mist hover:bg-charcoal-800/80 hover:text-parchment",
  },
  tab: {
    base: "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium tracking-wide transition-colors duration-200",
    active: "text-gold-300",
    inactive: "text-slate-dim hover:text-parchment",
  },
} as const;

export type NavAnchorProps = {
  href: string;
  active: boolean;
  variant: keyof typeof variants;
  children: ReactNode;
};

/** The props shared by NavLink (highlights itself) and StaticNavLink (never highlights). */
export type NavLinkProps = Omit<NavAnchorProps, "active"> & {
  /** Only highlight on this exact path (used for individual school links). */
  exact?: boolean;
};

/**
 * Used while the current URL is not yet known (the Suspense fallback):
 * renders the same link, just without a highlight.
 */
export function StaticNavLink({ href, variant, children }: NavLinkProps) {
  return (
    <NavAnchor href={href} variant={variant} active={false}>
      {children}
    </NavAnchor>
  );
}

/**
 * A navigation link with no browser-only code, so it can render on the server.
 * NavLink wraps it to work out `active`; the Suspense fallback uses it directly.
 * aria-current="page" tells screen readers which page is open.
 */
export function NavAnchor({ href, active, variant, children }: NavAnchorProps) {
  const style = variants[variant];
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(style.base, active ? style.active : style.inactive)}
    >
      {children}
    </Link>
  );
}
