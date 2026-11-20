"use server";

import { updateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { LEARNER_DATA_TAG } from "@/lib/data/cache-tags";
import { checkProfile, type ProfileFieldErrors, type ProfileInput } from "@/lib/profile/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProfileFormState =
  | { status: "idle" }
  | { status: "saved"; value: ProfileInput }
  | { status: "error"; message?: string; errors?: ProfileFieldErrors; value: { displayName: string; title: string } };

/**
 * SERVER ACTION: save the learner's display name and title.
 *
 * Three independent locks protect this write:
 *  1. getCurrentUser(): only a signed-in learner can save.
 *  2. checkProfile(): the text is cleaned and length-checked here.
 *  3. The database: Row Level Security only lets you update YOUR row, a
 *     column-level grant only allows display_name and title, and CHECK
 *     constraints enforce 1–60 characters.
 */
export async function updateProfile(_previous: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const typed = {
    displayName: String(formData.get("displayName") ?? ""),
    title: String(formData.get("title") ?? ""),
  };

  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Your session has ended. Sign in again to save changes.", value: typed };
  }

  const checked = checkProfile(typed);
  if (!checked.ok) return { status: "error", errors: checked.errors, value: typed };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: checked.value.displayName, title: checked.value.title })
    .eq("id", user.id)
    // Ask for the row back so "0 rows changed" can't be mistaken for success.
    .select("id")
    .single();

  if (error) {
    console.error("[profile] update failed:", error.code, error.message);
    return { status: "error", message: "Your profile couldn't be saved. Try again in a moment.", value: typed };
  }

  // Read-your-own-writes: the next page load fetches fresh learner data.
  updateTag(LEARNER_DATA_TAG);
  return { status: "saved", value: checked.value };
}
