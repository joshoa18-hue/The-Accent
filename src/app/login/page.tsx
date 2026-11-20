import type { Metadata } from "next";
import { Suspense } from "react";
import { LogoMark } from "@/components/layout/Logo";
import { Card } from "@/components/ui/Card";
import { safeNextPath } from "@/lib/auth/redirect";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

const errorMessages: Record<string, string> = {
  link: "That sign-in link is invalid or has expired. Request a new one below.",
};

/** Reads ?next= and ?error= from the URL, so it sits inside <Suspense>. */
async function LoginPanel({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const errorKey = typeof params.error === "string" ? params.error : undefined;
  const linkError = errorKey ? errorMessages[errorKey] : undefined;
  // Only in local development: point at the mail catcher that holds test emails.
  const devMailboxUrl = process.env.NODE_ENV === "development" ? process.env.DEV_MAILBOX_URL : undefined;

  return (
    <>
      {linkError ? (
        <p role="alert" className="mb-4 rounded-lg border border-ember/40 bg-ember/10 p-3 text-sm text-ember">
          {linkError}
        </p>
      ) : null}
      <LoginForm next={next} devMailboxUrl={devMailboxUrl} />
    </>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center pt-6 sm:pt-16">
      <LogoMark className="size-12" />
      <h1 className="mt-5 text-center font-display text-4xl text-parchment">Continue your ascent</h1>
      <p className="mt-2 text-center text-mist">Sign in to see your character and progress.</p>
      <Card className="mt-8 w-full">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-charcoal-800/50" />}>
          <LoginPanel searchParams={searchParams} />
        </Suspense>
      </Card>
    </div>
  );
}
