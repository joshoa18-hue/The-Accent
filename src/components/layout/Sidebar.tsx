import { Suspense, type ComponentType } from "react";
import { NavIcon, SchoolIcon } from "@/components/icons/AppIcons";
import { primaryNav } from "@/config/navigation";
import type { School } from "@/types/school";
import { Logo } from "./Logo";
import { StaticNavLink, type NavLinkProps } from "./NavAnchor";
import { NavLink } from "./NavLink";

type SidebarNavProps = {
  schools: School[];
  /** Which link component to use: NavLink (highlights) or StaticNavLink (fallback). */
  LinkComponent: ComponentType<NavLinkProps>;
};

function SidebarNav({ schools, LinkComponent }: SidebarNavProps) {
  return (
    <nav aria-label="Main" className="flex-1 overflow-y-auto px-4 pb-6">
      <ul className="space-y-1">
        {primaryNav.map((item) => (
          <li key={item.href}>
            <LinkComponent href={item.href} variant="sidebar">
              <NavIcon name={item.icon} className="size-[1.15rem]" />
              <span>{item.label}</span>
            </LinkComponent>
          </li>
        ))}
      </ul>

      <p
        id="sidebar-schools-heading"
        className="mt-8 mb-2 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-dim"
      >
        Academic Schools
      </p>
      <ul aria-labelledby="sidebar-schools-heading" className="space-y-0.5">
        {schools.map((school) => (
          <li key={school.slug}>
            <LinkComponent href={`/schools/${school.slug}`} variant="sidebar" exact>
              <SchoolIcon
                name={school.icon}
                className="size-4 shrink-0 text-gold-600 transition-colors group-hover:text-gold-400"
              />
              <span className="truncate">{school.shortName}</span>
            </LinkComponent>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Desktop navigation, fixed on the left. Hidden below the `lg` breakpoint (1024px). */
export function Sidebar({ schools }: { schools: School[] }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-charcoal-800 bg-navy-950/85 backdrop-blur-xl lg:flex">
      <div className="px-7 pt-7 pb-8">
        <Logo />
      </div>
      {/*
        NavLink reads the current URL. For a URL that isn't known at build time
        (e.g. a mistyped school address) it must wait, so Suspense shows the
        same links without a highlight until it is ready.
      */}
      <Suspense fallback={<SidebarNav schools={schools} LinkComponent={StaticNavLink} />}>
        <SidebarNav schools={schools} LinkComponent={NavLink} />
      </Suspense>
      <p className="border-t border-charcoal-800 px-7 py-4 text-xs text-slate-dim">
        Milestone 1 · Foundation
      </p>
    </aside>
  );
}
