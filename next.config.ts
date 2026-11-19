import type { NextConfig } from "next";

/**
 * Baseline security headers sent with every response.
 * They cost nothing and close off common browser-level attacks.
 * A full Content-Security-Policy is planned for when Supabase is added
 * (see ROADMAP.md), because it must list the Supabase domain.
 */
const securityHeaders = [
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
