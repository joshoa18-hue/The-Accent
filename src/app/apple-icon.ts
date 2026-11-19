import { renderAppIcon } from "@/lib/brand/app-icon";

/* iOS home-screen icon. iOS rounds the corners itself, so we draw full-bleed. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderAppIcon({ size: size.width, maskable: true });
}
