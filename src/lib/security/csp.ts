/**
 * CONTENT-SECURITY-POLICY: the browser's allow-list for this site.
 *
 * It tells the browser which places may supply scripts, styles, images and
 * fonts, where the page may connect, and who may embed it. If an attacker
 * ever managed to inject HTML, the browser would refuse to load anything
 * from their server or send data to it.
 *
 * Why so short: The Ascent loads everything from its own origin. Fonts are
 * self-hosted by next/font, icons are inline SVG, and the BROWSER never talks
 * to Supabase (only our server does), so no outside domain is needed.
 *
 * The documented trade-off: script-src allows 'unsafe-inline'. Next.js puts
 * small inline scripts in every page. The alternative, a per-request nonce,
 * would force every page to render on each request and switch off the
 * prebuilt static pages (see the Next.js CSP guide). Everything else is
 * locked down.
 */
export function buildContentSecurityPolicy({ isDev }: { isDev: boolean }): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // React's development tools need eval(); production builds don't.
    "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'"],
    // The dev server's hot reload uses a WebSocket.
    "connect-src": ["'self'", ...(isDev ? ["ws:"] : [])],
    "manifest-src": ["'self'"],
    "worker-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    ...(isDev ? {} : { "upgrade-insecure-requests": [] }),
  };

  return Object.entries(directives)
    .map(([name, values]) => [name, ...values].join(" "))
    .join("; ");
}
