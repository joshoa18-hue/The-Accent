import type { ReactNode } from "react";
import type { School } from "@/types/school";
import { MobileHeader, MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

/**
 * The frame around every page.
 * - Desktop (≥1024px): fixed sidebar on the left, content beside it.
 * - Mobile: brand bar on top, tab bar at the bottom.
 * Tailwind's `lg:` prefix means "from the large breakpoint upward".
 */
export function AppShell({ schools, children }: { schools: School[]; children: ReactNode }) {
  return (
    <>
      {/* Keyboard users can jump straight past the navigation. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-gold-400 focus:px-4 focus:py-2 focus:text-navy-950"
      >
        Skip to content
      </a>

      <Sidebar schools={schools} />

      <div className="lg:pl-72">
        <MobileHeader />
        <main
          id="main-content"
          className="mx-auto w-full max-w-7xl px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-14"
        >
          {children}
        </main>
      </div>

      <MobileNav />
    </>
  );
}
