"use client";

import { useActionState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { sendSignInLink, type SignInState } from "./actions";

const initialState: SignInState = { status: "idle" };

/**
 * The sign-in form. A Client Component only because it shows pending and
 * error states; the work itself happens in the sendSignInLink Server Action.
 * Without JavaScript the form still posts and works.
 */
export function LoginForm({ next, devMailboxUrl }: { next: string; devMailboxUrl?: string }) {
  const [state, formAction, pending] = useActionState(sendSignInLink, initialState);

  if (state.status === "sent") {
    return (
      <div role="status" className="space-y-3">
        <MailCheck aria-hidden className="size-8 text-gold-400" />
        <p className="font-display text-2xl text-parchment">Check your inbox</p>
        <p className="text-sm leading-relaxed text-mist">
          We sent a sign-in link to <strong className="text-parchment">{state.email}</strong>. It works once and
          expires in an hour. You can close this tab.
        </p>
        {devMailboxUrl ? (
          <p className="rounded-lg border border-gold-700/40 bg-gold-900/10 p-3 text-xs text-gold-300">
            Local development: emails don&apos;t really send. Open the mail catcher at{" "}
            <a className="underline hover:text-gold-200" href={devMailboxUrl} target="_blank" rel="noreferrer">
              {devMailboxUrl}
            </a>
            .
          </p>
        ) : null}
      </div>
    );
  }

  const error = state.status === "error" ? state : null;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-parchment">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={error?.email}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "email-error" : "email-hint"}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-charcoal-600 bg-navy-950/60 px-4 py-3 text-parchment placeholder:text-slate-dim focus:border-gold-500 focus:outline-none aria-[invalid=true]:border-ember"
        />
        {error ? (
          <p id="email-error" role="alert" className="text-sm text-ember">
            {error.message}
          </p>
        ) : (
          <p id="email-hint" className="text-xs text-slate-dim">
            No password needed. New here? The same link creates your account.
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3 font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
        {pending ? "Sending link…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
