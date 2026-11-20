import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Shows who is signed in, with a real Sign out button, or a Sign in link.
 * Reads the session (cookies), so it must be rendered inside <Suspense>.
 */
export async function AccountStatus({ compact = false }: { compact?: boolean }) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link
        href={routes.login()}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gold-400 hover:bg-charcoal-800/60 hover:text-gold-300"
      >
        <LogIn aria-hidden className="size-4" />
        Sign in
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", compact ? "justify-end" : "justify-between")}>
      {compact ? null : (
        <p className="min-w-0 text-xs text-slate-dim">
          Signed in as
          <span className="block truncate text-sm text-mist" title={user.email ?? undefined}>
            {user.email ?? "your account"}
          </span>
        </p>
      )}
      {/* A <form> with a Server Action: a genuine button that works even without JavaScript. */}
      <form action={signOut}>
        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-charcoal-700 px-3 py-1.5 text-xs font-medium text-mist transition-colors hover:border-gold-600/60 hover:text-parchment"
        >
          <LogOut aria-hidden className="size-3.5" />
          Sign out
        </button>
      </form>
    </div>
  );
}
