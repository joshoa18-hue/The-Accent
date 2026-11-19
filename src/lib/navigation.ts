/**
 * Is the link `href` the page the user is on?
 *
 * - exact: only the identical path counts ("/" must not light up everywhere).
 * - otherwise: the path or anything below it counts, so "/schools" stays
 *   highlighted on "/schools/music-creative-arts".
 */
export function isActivePath(pathname: string, href: string, exact = false): boolean {
  if (exact || href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
