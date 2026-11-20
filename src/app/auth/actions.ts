"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * SERVER ACTION: sign out.
 * Ends the session in Supabase and clears the session cookies, then goes to
 * the sign-in page. Used by a real <button> inside a <form>.
 */
export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  // Throw away every page the browser has cached for the signed-in user, so
  // nothing personal is shown after signing out.
  revalidatePath("/", "layout");
  redirect(routes.login());
}
