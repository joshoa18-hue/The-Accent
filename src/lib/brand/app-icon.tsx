import { ImageResponse } from "next/og";

/**
 * Brand colours for generated images. ImageResponse renders outside the
 * browser, so it cannot read our CSS variables; these mirror globals.css.
 */
export const brandColors = {
  navy950: "#060b18",
  navy800: "#101b36",
  gold300: "#ecd396",
  gold400: "#e0bb6b",
  gold500: "#cfa24a",
} as const;

type AppIconOptions = {
  /** Width and height in pixels. */
  size: number;
  /**
   * Maskable icons may be cropped to a circle or squircle by Android, so the
   * artwork must sit inside the central 80% "safe zone" on a full-bleed
   * background. Regular icons use rounded corners instead.
   */
  maskable?: boolean;
};

/**
 * Renders The Ascent mark (the same peak as `LogoMark`) to a PNG.
 * Used by the favicon-style routes and the PWA manifest icons.
 */
export function renderAppIcon({ size, maskable = false }: AppIconOptions) {
  const artwork = maskable ? Math.round(size * 0.7) : size;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: maskable ? brandColors.navy800 : "transparent",
        }}
      >
        <svg width={artwork} height={artwork} viewBox="0 0 32 32">
          {maskable ? null : <rect width="32" height="32" rx="7" fill={brandColors.navy800} />}
          <path d="M5 24 L13.5 10 L18 17 L20.5 13.5 L27 24 Z" fill={brandColors.gold500} fillOpacity="0.25" />
          <path
            d="M5 24 L13.5 10 L18 17 L20.5 13.5 L27 24"
            fill="none"
            stroke={brandColors.gold400}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="13.5" cy="10" r="1.6" fill={brandColors.gold300} />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
