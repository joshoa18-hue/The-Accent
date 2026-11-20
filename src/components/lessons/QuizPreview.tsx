import type { PublicQuizQuestion } from "@/types/lesson";

/**
 * The lesson's check-your-understanding questions, shown READ-ONLY.
 *
 * There are deliberately no radio buttons or submit button yet: answering and
 * earning XP arrive in the next checkpoint, when the database can check the
 * answers. Until then nothing here may look clickable (project rule 1).
 * It receives questions WITHOUT answers (PublicQuizQuestion).
 */
export function QuizPreview({ questions }: { questions: readonly PublicQuizQuestion[] }) {
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
      <p className="mt-5 rounded-lg border border-charcoal-700 bg-charcoal-900/70 p-3 text-sm text-slate-dim">
        Answering these questions and earning XP for this lesson is coming in the next update.
      </p>
    </div>
  );
}
