/**
 * Checks the profile form before anything is saved.
 *
 * The database has the same limits (CHECK constraints: 1–60 characters), so
 * even a request that skips this function can't store bad data. Checking here
 * as well gives the learner a clear message instead of a database error.
 */
export const PROFILE_TEXT_MAX = 60;

export type ProfileInput = { displayName: string; title: string };
export type ProfileFieldErrors = Partial<Record<keyof ProfileInput, string>>;
export type ProfileCheck = { ok: true; value: ProfileInput } | { ok: false; errors: ProfileFieldErrors };

/** Trim, squash runs of whitespace, and remove invisible control characters. */
export function cleanText(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function checkField(value: string, label: string): string | undefined {
  if (value.length === 0) return `Enter a ${label}.`;
  if (value.length > PROFILE_TEXT_MAX) return `Keep your ${label} to ${PROFILE_TEXT_MAX} characters or fewer.`;
  return undefined;
}

export function checkProfile(raw: { displayName: unknown; title: unknown }): ProfileCheck {
  const value = { displayName: cleanText(raw.displayName), title: cleanText(raw.title) };
  const errors: ProfileFieldErrors = {};
  const nameError = checkField(value.displayName, "display name");
  const titleError = checkField(value.title, "title");
  if (nameError) errors.displayName = nameError;
  if (titleError) errors.title = titleError;
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value };
}
