import Link from "next/link";
import { Card } from "@/components/ui/Card";

/** Shown for any address that doesn't match a page, and whenever notFound() is called. */
export default function NotFound() {
  return (
    <Card className="mx-auto mt-10 max-w-lg text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">This path doesn&apos;t exist</h1>
      <p className="mt-2 text-sm text-mist">The page you were looking for could not be found.</p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"
      >
        Return to the dashboard
      </Link>
    </Card>
  );
}
