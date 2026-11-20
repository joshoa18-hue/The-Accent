import type { NextConfig } from "next";
import { buildContentSecurityPolicy } from "./src/lib/security/csp";

/**
 * "report-only": the browser logs anything the policy WOULD block, but blocks
 * nothing (safe for testing a new policy). "enforce": the browser blocks it.
 */
// Enforced after testing every page in report-only mode with no violations
// (Milestone 2, checkpoint 3). Switch back to "report-only" to trial changes.
const CSP_MODE = "enforce" as "report-only" | "enforce";

/**
 * Baseline security headers sent with every response.
 * They cost nothing and close off common browser-level attacks.
 */
const securityHeaders = [
  // The browser's allow-list for scripts, styles, images and connections (src/lib/security/csp.ts).
  {
    key: CSP_MODE === "enforce" ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
    value: buildContentSecurityPolicy({ isDev: process.env.NODE_ENV === "development" }),
  },
  // Stop browsers from guessing file types (MIME sniffing).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Forbid other sites from embedding The Ascent in an <iframe> (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Only send our origin (not full URLs) to other sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // We use none of these browser features, so switch them off.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Cache Components + Partial Prefetching are the Next.js 16 defaults for new apps.
  cacheComponents: true,
  partialPrefetching: true,
  // Don't advertise which framework we run.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
