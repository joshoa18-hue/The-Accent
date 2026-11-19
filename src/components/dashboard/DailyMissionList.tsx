import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DailyMission, TaskStatus } from "@/types/activity";

/** One lookup table keeps icon, colour and wording for each status together. */
const statusDisplay: Record<TaskStatus, { label: string; Icon: typeof Circle; className: string }> = {
  completed: { label: "Completed", Icon: CheckCircle2, className: "text-emerald-soft" },
  in_progress: { label: "In progress", Icon: CircleDot, className: "text-gold-400" },
  not_started: { label: "Not started", Icon: Circle, className: "text-slate-dim" },
};

/**
 * Today's missions. Read-only on purpose: there is no "complete" button,
 * because completion (and its XP) must be verified by the server — that
 * arrives with the database in Milestone 2.
 */
export function DailyMissionList({ missions }: { missions: DailyMission[] }) {
  const done = missions.filter((m) => m.status === "completed").length;

  return (
    <div>
      <p className="mb-3 text-xs text-slate-dim">
        {done} of {missions.length} completed today
      </p>
      <ul className="space-y-3">
        {missions.map((mission) => {
          const status = statusDisplay[mission.status];
          return (
            <li key={mission.id} className="flex items-start gap-3">
              <status.Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", status.className)} />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    mission.status === "completed" ? "text-mist line-through decoration-charcoal-600" : "text-parchment",
                  )}
                >
                  {mission.title}
                </p>
                <p className="text-xs text-slate-dim">
                  <span className="sr-only">{status.label}. </span>
                  {mission.description}
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-gold-400">+{mission.xpReward} XP</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
