/**
 * The main navigation. Only pages that really exist belong here —
 * a link to an unbuilt page would be a "fake" button.
 * Icons are referenced by name; NavIcon turns the name into an icon.
 */
export type NavIconName = "dashboard" | "schools" | "character";

export interface NavItem {
  href: string;
  label: string;
  icon: NavIconName;
}

export const primaryNav: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/schools", label: "Schools", icon: "schools" },
  { href: "/character", label: "Character", icon: "character" },
];
