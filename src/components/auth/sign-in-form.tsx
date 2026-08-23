"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { signInAction, type AuthState } from "@/lib/auth/actions";
import { Alert } from "@/components/ui/alert";
import { FieldInput, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

function SubmitButton({ idle, pending }: { idle: string; pending: string }) {
  const { pending: isPending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" arrow disabled={isPending}>
      {isPending ? pending : idle}
    </Button>
  );
}

type Props = {
  locale: Locale;
  t: Dictionary;
  nextPath?: string;
};

const initial: AuthState = {};

export function SignInForm({ locale, t, nextPath }: Props) {
  const [state, action] = useActionState(signInAction, initial);
  const copy = t.pages.auth.signIn;

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="signin-email">{copy.emailLabel}</FieldLabel>
        <FieldInput
          id="signin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          underline
        />
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="signin-password">{copy.passwordLabel}</FieldLabel>
        <FieldInput
          id="signin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          underline
        />
      </div>
      {state.error ? <Alert>{state.error}</Alert> : null}
      <SubmitButton idle={copy.submit} pending={copy.pendingSubmit} />
    </form>
  );
}
