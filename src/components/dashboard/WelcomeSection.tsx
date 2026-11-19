import { CharacterEmblem } from "@/components/character/CharacterEmblem";
import { SampleDataNotice } from "@/components/ui/SampleDataNotice";
import { formatNumber } from "@/lib/utils";
import type { DataSource } from "@/types/data";
import type { CharacterSummary } from "@/types/progression";

type WelcomeSectionProps = {
  character: CharacterSummary;
  coursesInProgress: number;
  achievementsEarned: number;
  source: DataSource;
};

/** The dashboard hero: greeting plus four headline numbers. */
export function WelcomeSection({ character, coursesInProgress, achievementsEarned, source }: WelcomeSectionProps) {
  const stats = [
    { label: "Level", value: String(character.level.level) },
    { label: "Total XP", value: formatNumber(character.level.totalXp) },
    { label: "Courses in progress", value: String(coursesInProgress) },
    { label: "Achievements", value: String(achievementsEarned) },
  ];

  return (
    <section
      aria-labelledby="welcome-heading"
      className="relative overflow-hidden rounded-3xl border border-gold-700/30 bg-gradient-to-br from-navy-700/80 via-navy-800/90 to-charcoal-900 p-6 shadow-xl shadow-black/30 sm:p-8"
    >
      {/* Decorative glow; aria-hidden keeps it away from screen readers. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-gold-500/10 blur-3xl"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <CharacterEmblem name={character.profile.displayName} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              {character.profile.title}
            </p>
            <h1 id="welcome-heading" className="font-display text-3xl font-semibold sm:text-4xl">
              Welcome back, {character.profile.displayName}
            </h1>
          </div>
        </div>
        <SampleDataNotice source={source} />
      </div>

      <p className="relative mt-4 max-w-xl text-mist">
        Every lesson is a step upward. Choose today&apos;s path and continue your ascent.
      </p>

      <dl className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-charcoal-700/60 bg-navy-950/40 px-4 py-3">
            <dt className="text-xs text-slate-dim">{stat.label}</dt>
            <dd className="mt-0.5 font-display text-2xl font-semibold text-gold-300">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
