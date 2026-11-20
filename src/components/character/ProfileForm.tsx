"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateProfile, type ProfileFormState } from "@/app/character/actions";
import { PROFILE_TEXT_MAX } from "@/lib/profile/validation";

type Field = { name: "displayName" | "title"; label: string; hint: string; autoComplete?: string };

const fields: Field[] = [
  { name: "displayName", label: "Display name", hint: "Shown on your dashboard and character sheet.", autoComplete: "nickname" },
  { name: "title", label: "Title", hint: "A short motto under your name, e.g. “Seeker of Wisdom”." },
];

/**
 * Edit display name and title. A Client Component only for the pending,
 * saved and error states; saving happens in the updateProfile Server Action.
 */
export function ProfileForm({ displayName, title }: { displayName: string; title: string }) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(updateProfile, { status: "idle" });

  const values = state.status === "idle" ? { displayName, title } : state.value;
  const errors = state.status === "error" ? (state.errors ?? {}) : {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {fields.map((field) => {
        const error = errors[field.name];
        const describedBy = `${field.name}-${error ? "error" : "hint"}`;
        return (
          <div key={field.name} className="space-y-1.5">
            <label htmlFor={field.name} className="block text-sm font-medium text-parchment">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type="text"
              required
              maxLength={PROFILE_TEXT_MAX}
              autoComplete={field.autoComplete ?? "off"}
              // `key` resets the field to the saved value after each response.
              key={`${field.name}-${values[field.name]}`}
              defaultValue={values[field.name]}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              className="w-full rounded-xl border border-charcoal-600 bg-navy-950/60 px-4 py-2.5 text-parchment placeholder:text-slate-dim focus:border-gold-500 focus:outline-none aria-[invalid=true]:border-ember"
            />
            {error ? (
              <p id={describedBy} className="text-sm text-ember">
                {error}
              </p>
            ) : (
              <p id={describedBy} className="text-xs text-slate-dim">
                {field.hint}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
          {pending ? "Saving…" : "Save profile"}
        </button>
        <p aria-live="polite" className="text-sm">
          {state.status === "saved" ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-soft">
              <Check aria-hidden className="size-4" /> Saved
            </span>
          ) : state.status === "error" && state.message ? (
            <span role="alert" className="text-ember">
              {state.message}
            </span>
          ) : null}
        </p>
      </div>
    </form>
  );
}
