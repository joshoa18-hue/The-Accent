import { cn } from "@/lib/utils";

/**
 * A heraldic-style emblem showing the learner's initial.
 * Placeholder until custom avatars are added in a later milestone.
 */
export function CharacterEmblem({ name, className }: { name: string; className?: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      aria-hidden
      className={cn(
        "grid size-16 shrink-0 place-items-center rounded-full bg-gradient-to-b from-gold-400 to-gold-700 p-[2px] shadow-lg shadow-gold-900/30",
        className,
      )}
    >
      <div className="grid size-full place-items-center rounded-full bg-gradient-to-b from-navy-700 to-navy-950">
        <span className="font-display text-2xl font-semibold text-gold-300">{initial}</span>
      </div>
    </div>
  );
}
