import { renderAppIcon } from "@/lib/brand/app-icon";

/**
 * PNG icons for the web app manifest (src/app/manifest.ts).
 * Rendered once at build time from code, so there are no binary files to keep
 * in sync with the logo.
 */
const variants = {
  "icon-192.png": { size: 192 },
  "icon-512.png": { size: 512 },
  "icon-maskable-512.png": { size: 512, maskable: true },
} as const;

type Variant = keyof typeof variants;

export function generateStaticParams() {
  return Object.keys(variants).map((variant) => ({ variant }));
}

function isVariant(value: string): value is Variant {
  return Object.hasOwn(variants, value);
}

export async function GET(_request: Request, { params }: RouteContext<"/icons/[variant]">) {
  const { variant } = await params;
  if (!isVariant(variant)) {
    return new Response("Not found", { status: 404 });
  }
  return renderAppIcon(variants[variant]);
}
