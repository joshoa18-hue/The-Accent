import type { Metadata } from "next";
import { LevelSummary } from "@/components/character/LevelSummary";
import { Card } from "@/components/ui/Card";
import { SampleDataNotice } from "@/components/ui/SampleDataNotice";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCharacterSummary } from "@/lib/data/character";

export const metadata: Metadata = { title: "Character" };

/**
 * CHARACTER — foundation version (Milestone 1, checkpoint 1).
 * Checkpoint 2 adds attributes, school mastery and achievements.
 */
export default async function CharacterPage() {
  const { data: character, source } = await getCharacterSummary();

  return (
    <div className="space-y-8">
      <SectionHeading
        as="h1"
        eyebrow="Character"
        title={character.profile.displayName}
        description={character.profile.title}
        action={<SampleDataNotice source={source} />}
      />
      <section aria-labelledby="character-level-heading">
        <Card>
          <h2 id="character-level-heading" className="sr-only">
            Level and experience
          </h2>
          <LevelSummary level={character.level} />
        </Card>
      </section>
    </div>
  );
}
