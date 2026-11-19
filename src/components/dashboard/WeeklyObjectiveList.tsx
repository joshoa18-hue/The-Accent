import { ProgressBar } from "@/components/ui/ProgressBar";
import type { WeeklyObjective } from "@/types/activity";

/** This week's larger goals, each with a progress bar. */
export function WeeklyObjectiveList({ objectives }: { objectives: WeeklyObjective[] }) {
  return (
    <ul className="space-y-4">
      {objectives.map((objective) => {
        const complete = objective.current >= objective.target;
        return (
          <li key={objective.id}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-parchment">{objective.title}</span>
              <span className="shrink-0 text-xs font-semibold text-gold-400">+{objective.xpReward} XP</span>
            </div>
            <ProgressBar value={objective.current} max={objective.target} label={objective.title} size="sm" />
            <p className="mt-1.5 text-xs text-slate-dim">
              {objective.current} of {objective.target} {objective.unit}
              {complete && " · Complete"}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
