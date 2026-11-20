/** Placeholder shown while a private page checks who is signed in. */
export function PageSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-6">
      <div className="h-40 animate-pulse rounded-2xl bg-charcoal-900/70" />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-charcoal-900/70" />
        ))}
      </div>
    </div>
  );
}
