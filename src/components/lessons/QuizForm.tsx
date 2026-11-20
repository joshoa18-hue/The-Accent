"use client";

import { useActionState } from "react";
import { CheckCircle2, CircleAlert, Loader2, Sparkles } from "lucide-react";
import { submitQuiz, type QuizState } from "@/app/lessons/[lessonId]/actions";
import { answerFieldName } from "@/lib/lessons/quiz";
import { cn } from "@/lib/utils";
import type { PublicQuizQuestion } from "@/types/lesson";

type QuizFormProps = {
  lessonId: string;
  questions: readonly PublicQuizQuestion[];
  xpReward: number;
  alreadyCompleted: boolean;
};

/**
 * The lesson quiz for a signed-in learner.
 *
 * A Client Component only to show pending, retry and result states. The
 * answers are checked by the database (via the submitQuiz Server Action);
 * nothing here can award XP. It never receives the answer key, only
 * questions and choices, and explanations arrive after a pass.
 */
export function QuizForm({ lessonId, questions, xpReward, alreadyCompleted }: QuizFormProps) {
  const [state, formAction, pending] = useActionState<QuizState, FormData>(submitQuiz, { status: "idle" });

  const answers = state.status === "idle" ? {} : state.answers;
  const wrong = state.status === "retry" ? state.wrong : [];
  const unanswered = state.status === "incomplete" ? state.unanswered : [];
  const explanations = state.status === "passed" ? state.explanations : {};

  return (
    // The key re-creates the form after each answer, so the learner's choices
    // stay selected (React resets uncontrolled fields after an action).
    <form key={JSON.stringify(state)} action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="lessonId" value={lessonId} />

      {alreadyCompleted && state.status === "idle" ? (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-soft/30 bg-emerald-soft/10 p-3 text-sm text-emerald-soft">
          <CheckCircle2 aria-hidden className="size-4" />
          You&apos;ve completed this lesson. You can retake the quiz for practice; it won&apos;t award XP again.
        </p>
      ) : null}

      <ol className="space-y-6">
        {questions.map((question, index) => {
          const isWrong = wrong.includes(question.id);
          const isUnanswered = unanswered.includes(question.id);
          const explanation = explanations[question.id];
          const statusId = `${question.id}-status`;
          return (
            <li key={question.id}>
              <fieldset aria-describedby={isWrong || isUnanswered ? statusId : undefined}>
                <legend className="font-medium text-parchment">
                  {index + 1}. {question.prompt}
                </legend>
                <div className="mt-2 space-y-1.5">
                  {question.choices.map((choice) => (
                    <label
                      key={choice.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                        "border-charcoal-700 text-mist hover:border-gold-700/60 has-[:checked]:border-gold-500 has-[:checked]:bg-gold-900/15 has-[:checked]:text-parchment",
                      )}
                    >
                      <input
                        type="radio"
                        name={answerFieldName(question.id)}
                        value={choice.id}
                        defaultChecked={answers[question.id] === choice.id}
                        className="mt-0.5 accent-gold-500"
                      />
                      {choice.text}
                    </label>
                  ))}
                </div>
                {isWrong ? (
                  <p id={statusId} className="mt-2 flex items-center gap-1.5 text-sm text-ember">
                    <CircleAlert aria-hidden className="size-4" /> Not quite. Re-read that part of the lesson and try again.
                  </p>
                ) : null}
                {isUnanswered ? (
                  <p id={statusId} className="mt-2 text-sm text-ember">
                    Choose an answer for this question.
                  </p>
                ) : null}
                {explanation ? (
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-emerald-soft">
                    <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0" /> {explanation}
                  </p>
                ) : null}
              </fieldset>
            </li>
          );
        })}
      </ol>

      <div aria-live="polite">
        {state.status === "passed" ? (
          <div role="status" className="rounded-2xl border border-gold-600/50 bg-gold-900/15 p-4">
            <p className="flex items-center gap-2 font-display text-xl text-gold-300">
              <Sparkles aria-hidden className="size-5" />
              {state.awarded ? `Lesson complete: +${state.xp} XP` : "All correct"}
            </p>
            <p className="mt-1 text-sm text-mist">
              {state.awarded
                ? "Your XP has been recorded. Your level, attributes and mastery update automatically."
                : "You've already earned this lesson's XP, so nothing extra was added."}
            </p>
          </div>
        ) : null}
        {state.status === "retry" ? (
          <p role="status" className="text-sm text-mist">
            {state.wrong.length === 1 ? "One answer needs another look." : `${state.wrong.length} answers need another look.`}{" "}
            No XP is lost by trying again.
          </p>
        ) : null}
        {state.status === "error" ? (
          <p role="alert" className="text-sm text-ember">
            {state.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
        {pending ? "Checking…" : alreadyCompleted || state.status === "passed" ? "Check answers again" : `Check answers (+${xpReward} XP)`}
      </button>
    </form>
  );
}
