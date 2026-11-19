"use client";
/**
 * "use client" marks this file as a Client Component: it also runs in the
 * browser. We need that because usePathname() reads the browser's URL to
 * know which link to highlight. Everything else in the layout stays on the
 * server.
 */
import { usePathname } from "next/navigation";
import { isActivePath } from "@/lib/navigation";
import { NavAnchor, type NavLinkProps } from "./NavAnchor";

export function NavLink({ exact, ...props }: NavLinkProps) {
  const pathname = usePathname();
  return <NavAnchor {...props} active={isActivePath(pathname, props.href, exact)} />;
}
