"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { routes } from "@/lib/routes";

/**
 * Shown when something on a page fails unexpectedly, for example if the
 * database can't be reached. Next.js wraps every page in this error boundary.
 *
 * It must be a Client Component. It deliberately shows NO error details:
 * those could reveal how the app works internally. In production Next.js
 * replaces server error messages with a generic one and a `digest` id, which
 * matches an entry in the server logs.
 */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest =
    typeof error === "object" && error !== null && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : null;

  return (
    <Card className="mx-auto mt-10 max-w-lg text-center">
      <h1 className="font-display text-3xl text-parchment">Something went wrong</h1>
      <p className="mt-3 text-mist">
        This page couldn&apos;t be loaded just now. Your progress is safe; nothing was lost. Try again in a moment.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400"
        >
          <RotateCcw aria-hidden className="size-4" />
          Try again
        </button>
        {/* A plain link (full page load) is the most reliable way out of a broken page. */}
        <a href={routes.dashboard()} className="text-sm font-medium text-gold-400 hover:text-gold-300">
          Go to the dashboard
        </a>
      </div>
      {digest ? <p className="mt-6 text-xs text-slate-dim">Reference: {digest}</p> : null}
    </Card>
  );
}
