import { Suspense } from "react";
import type { Metadata } from "next";
import { AchievementList } from "@/components/character/AchievementList";
import { AttributeList } from "@/components/character/AttributeList";
import { CharacterEmblem } from "@/components/character/CharacterEmblem";
import { LevelSummary } from "@/components/character/LevelSummary";
import { MasteryList } from "@/components/character/MasteryList";
import { ProfileForm } from "@/components/character/ProfileForm";
import { XpHistory } from "@/components/character/XpHistory";
import { Panel } from "@/components/ui/Panel";
import { SampleDataNotice } from "@/components/ui/SampleDataNotice";
import { getAchievements } from "@/lib/data/activity";
import { getCharacterSummary, getRecentXpTransactions } from "@/lib/data/character";
import { getSchools } from "@/lib/data/schools";
import { combineSources } from "@/lib/data/source";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { requireUser } from "@/lib/auth/session";
import { routes } from "@/lib/routes";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Character" };

/** The character sheet: level, attributes, mastery, achievements and XP history. */
async function CharacterContent() {
  // Real check, next to the data. The Proxy's redirect is only a fast first pass.
  await requireUser(routes.character());

  const [character, schools, achievements, history] = await Promise.all([
    getCharacterSummary(),
    getSchools(),
    getAchievements(),
    getRecentXpTransactions(8),
  ]);
  const { profile, level, attributes, mastery } = character.data;
  const source = combineSources(character.source, schools.source, achievements.source, history.source);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CharacterEmblem name={profile.displayName} className="size-20" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Character</p>
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">{profile.displayName}</h1>
            <p className="text-sm text-mist">
              {profile.title} · Joined {formatDate(profile.joinedAt)}
            </p>
          </div>
        </div>
        <SampleDataNotice source={source} />
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel id="level" eyebrow="Progression" title="Level & Experience">
          <LevelSummary level={level} />
          <p className="mt-5 border-t border-charcoal-800 pt-4 text-xs leading-relaxed text-slate-dim">
            XP is recorded as a history of individual awards (see XP History below). Your level, attributes and
            mastery are all calculated from that history, never edited directly.
          </p>
        </Panel>

        <Panel id="attributes" eyebrow="Growth" title="Skill Attributes" className="xl:col-span-2">
          <AttributeList attributes={attributes} variant="detailed" />
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel id="mastery" eyebrow="Subjects" title="School Mastery" className="xl:col-span-2">
          <MasteryList schools={schools.data} mastery={mastery} />
        </Panel>

        <div className="space-y-6">
          <Panel id="achievements" eyebrow="Honours" title="Achievements">
            <AchievementList achievements={achievements.data} />
          </Panel>
          <Panel id="xp-history" eyebrow="Ledger" title="XP History">
            <XpHistory transactions={history.data} />
          </Panel>
        </div>
      </div>

      <Panel id="profile-settings" eyebrow="You" title="Your Profile" className="max-w-xl">
        <ProfileForm displayName={profile.displayName} title={profile.title} />
      </Panel>
    </div>
  );
}

/**
 * Private page: reading the session needs the request's cookies, so the
 * content renders inside <Suspense> and the static shell loads instantly.
 */
export default function CharacterPage() {
  return (
    <Suspense fallback={<PageSkeleton label="Loading your character" />}>
      <CharacterContent />
    </Suspense>
  );
}
