import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { getSchools } from "@/lib/data/schools";
import "./globals.css";

/*
 * next/font downloads these fonts at BUILD time and serves them from our own
 * site, so visitors' browsers never contact Google. Each font is exposed as a
 * CSS variable that globals.css plugs into Tailwind (font-sans, font-display).
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Ascent",
    // Child pages set a title such as "Character" → "Character · The Ascent".
    template: "%s · The Ascent",
  },
  description: "A lifelong personal learning academy with RPG-style progression across eight schools.",
  applicationName: "The Ascent",
};

export const viewport: Viewport = {
  themeColor: "#060b18",
  // Lets the layout extend under phone notches; MobileNav pads for the safe area.
  viewportFit: "cover",
};

/** The root layout wraps every page in the app. */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { data: schools } = await getSchools();

  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-dvh">
        <AppShell schools={schools}>{children}</AppShell>
      </body>
    </html>
  );
}
