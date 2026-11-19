import { Suspense, type ComponentType } from "react";
import { NavIcon } from "@/components/icons/AppIcons";
import { primaryNav } from "@/config/navigation";
import { Logo } from "./Logo";
import { StaticNavLink, type NavLinkProps } from "./NavAnchor";
import { NavLink } from "./NavLink";

/** Top bar on phones and tablets: just the brand, so content gets the space. */
export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-charcoal-800/80 bg-navy-950/85 px-4 py-3 backdrop-blur-xl lg:hidden">
      <Logo />
    </header>
  );
}

function TabLinks({ LinkComponent }: { LinkComponent: ComponentType<NavLinkProps> }) {
  return (
    <ul className="mx-auto flex max-w-md">
      {primaryNav.map((item) => (
        <li key={item.href} className="flex flex-1">
          <LinkComponent href={item.href} variant="tab">
            <NavIcon name={item.icon} className="size-5" />
            <span>{item.label}</span>
          </LinkComponent>
        </li>
      ))}
    </ul>
  );
}

/**
 * Bottom tab bar on phones and tablets — within thumb reach.
 * The padding uses env(safe-area-inset-bottom) so the bar clears the
 * iPhone home indicator when installed as an app.
 */
export function MobileNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-charcoal-800 bg-navy-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <Suspense fallback={<TabLinks LinkComponent={StaticNavLink} />}>
        <TabLinks LinkComponent={NavLink} />
      </Suspense>
    </nav>
  );
}
