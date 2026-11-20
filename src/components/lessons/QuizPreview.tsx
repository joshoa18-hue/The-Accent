import type { ReactNode } from "react";
import type { PublicQuizQuestion } from "@/types/lesson";

/**
 * The lesson's questions, shown READ-ONLY (for visitors who aren't signed in).
 * There are deliberately no radio buttons or submit button: nothing here may
 * look clickable (project rule 1). `footer` explains how to take part, e.g. a
 * sign-in link. It receives questions WITHOUT answers (PublicQuizQuestion).
 */
export function QuizPreview({ questions, footer }: { questions: readonly PublicQuizQuestion[]; footer?: ReactNode }) {
  return (
    <div>
      <ol className="space-y-5">
        {questions.map((question, index) => (
          <li key={question.id}>
            <p className="font-medium text-parchment">
              {index + 1}. {question.prompt}
            </p>
            <ul className="mt-2 space-y-1.5">
              {question.choices.map((choice, choiceIndex) => (
                <li key={choice.id} className="flex gap-2 text-sm text-mist">
                  <span aria-hidden className="font-semibold text-gold-500">
                    {String.fromCharCode(65 + choiceIndex)}.
                  </span>
                  {choice.text}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {footer ? (
        <div className="mt-5 rounded-lg border border-charcoal-700 bg-charcoal-900/70 p-3 text-sm text-slate-dim">{footer}</div>
      ) : null}
    </div>
  );
}
