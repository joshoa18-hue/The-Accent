import type { MetadataRoute } from "next";
import { brandColors } from "@/lib/brand/app-icon";

/**
 * Web app manifest: lets browsers install The Ascent to a home screen and
 * open it in its own window. Served at /manifest.webmanifest.
 *
 * Milestone 1 is "PWA-ready", not a full PWA: there is no service worker, so
 * the app does not work offline yet. See ROADMAP.md.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "The Ascent",
    short_name: "Ascent",
    description: "A lifelong personal learning academy with RPG-style progression across eight schools.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: brandColors.navy950,
    theme_color: brandColors.navy950,
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
