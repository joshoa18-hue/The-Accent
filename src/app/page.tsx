import { LevelSummary } from "@/components/character/LevelSummary";
import { Card } from "@/components/ui/Card";
import { SampleDataNotice } from "@/components/ui/SampleDataNotice";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCharacterSummary } from "@/lib/data/character";

/**
 * DASHBOARD — foundation version (Milestone 1, checkpoint 1).
 * Checkpoint 2 adds missions, objectives, schools, activity and achievements.
 */
export default async function DashboardPage() {
  const { data: character, source } = await getCharacterSummary();

  return (
    <div className="space-y-8">
      <SectionHeading
        as="h1"
        eyebrow="Dashboard"
        title={`Welcome back, ${character.profile.displayName}`}
        description="Every lesson is a step upward. Continue your ascent."
        action={<SampleDataNotice source={source} />}
      />
      <section aria-labelledby="dashboard-level-heading">
        <Card>
          <h2 id="dashboard-level-heading" className="sr-only">
            Your level
          </h2>
          <LevelSummary level={character.level} />
        </Card>
      </section>
    </div>
  );
}
