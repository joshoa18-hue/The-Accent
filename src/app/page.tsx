import { Suspense } from "react";
import { AchievementList } from "@/components/character/AchievementList";
import { AttributeList } from "@/components/character/AttributeList";
import { LevelSummary } from "@/components/character/LevelSummary";
import { ContinueLearningCard } from "@/components/dashboard/ContinueLearningCard";
import { DailyMissionList } from "@/components/dashboard/DailyMissionList";
import { LearningActivityList } from "@/components/dashboard/LearningActivityList";
import { WeeklyObjectiveList } from "@/components/dashboard/WeeklyObjectiveList";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { SchoolMasteryGrid } from "@/components/schools/SchoolMasteryGrid";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Panel } from "@/components/ui/Panel";
import {
  getAchievements,
  getDailyMissions,
  getLearningActivities,
  getWeeklyObjectives,
} from "@/lib/data/activity";
import { getCharacterSummary } from "@/lib/data/character";
import { getSchools } from "@/lib/data/schools";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { requireUser } from "@/lib/auth/session";
import { routes } from "@/lib/routes";
import { combineSources } from "@/lib/data/source";

/**
 * DASHBOARD
 * The page's job is to fetch data and arrange sections. Each section is its
 * own component that only displays what it is given (via props).
 */
async function DashboardContent() {
  // Real check, next to the data. The Proxy's redirect is only a fast first pass.
  await requireUser(routes.dashboard());

  // Promise.all starts every request at the same time and waits for all of
  // them. With a real database this is much faster than awaiting one by one.
  const [character, schools, missions, objectives, activities, achievements] = await Promise.all([
    getCharacterSummary(),
    getSchools(),
    getDailyMissions(),
    getWeeklyObjectives(),
    getLearningActivities(),
    getAchievements(),
  ]);

  const source = combineSources(
    character.source,
    schools.source,
    missions.source,
    objectives.source,
    activities.source,
    achievements.source,
  );
  const earnedCount = achievements.data.filter((a) => a.status === "earned").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <WelcomeSection
            character={character.data}
            coursesInProgress={activities.data.length}
            achievementsEarned={earnedCount}
            source={source}
          />
        </div>
        <ContinueLearningCard activity={activities.data[0]} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Panel
          id="character-profile"
          eyebrow={character.data.profile.title}
          title="Character Profile"
          action={<ArrowLink href={routes.character()}>View</ArrowLink>}
        >
          <LevelSummary level={character.data.level} />
        </Panel>

        <Panel id="skill-attributes" eyebrow="Growth" title="Skill Attributes">
          <AttributeList attributes={character.data.attributes} />
        </Panel>

        <Panel
          id="recent-achievements"
          eyebrow="Honours"
          title="Recent Achievements"
          action={<ArrowLink href={routes.character()}>All</ArrowLink>}
        >
          <AchievementList achievements={achievements.data} limit={4} />
        </Panel>

        <Panel id="daily-missions" eyebrow="Today" title="Daily Missions">
          <DailyMissionList missions={missions.data} />
        </Panel>

        <Panel id="weekly-objectives" eyebrow="This week" title="Weekly Objectives">
          <WeeklyObjectiveList objectives={objectives.data} />
        </Panel>

        <Panel id="current-learning" eyebrow="In progress" title="Current Learning">
          <LearningActivityList activities={activities.data} />
        </Panel>
      </div>

      <Panel
        id="academic-schools"
        eyebrow="The Academy"
        title="The Eight Schools"
        action={<ArrowLink href={routes.schools()}>All schools</ArrowLink>}
      >
        <SchoolMasteryGrid schools={schools.data} mastery={character.data.mastery} />
      </Panel>

      <p className="text-center text-xs text-slate-dim">
        Missions, objectives and achievements are completed automatically when you pass lessons. There&apos;s nothing to
        claim: the server checks your progress and records it.
      </p>
    </div>
  );
}

/**
 * Private page: reading the session needs the request's cookies, so the
 * content renders inside <Suspense> and the static shell loads instantly.
 */
export default function DashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton label="Loading your dashboard" />}>
      <DashboardContent />
    </Suspense>
  );
}
