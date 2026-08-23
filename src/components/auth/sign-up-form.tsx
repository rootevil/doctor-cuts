"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { signUpAction, type AuthState } from "@/lib/auth/actions";
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

const initial: AuthState = {};

export function SignUpForm({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [state, action] = useActionState(signUpAction, initial);
  const copy = t.pages.auth.signUp;

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="signup-name">{copy.nameLabel}</FieldLabel>
          <FieldInput id="signup-name" name="full_name" type="text" autoComplete="name" underline />
        </div>
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="signup-phone">{copy.phoneLabel}</FieldLabel>
          <FieldInput id="signup-phone" name="phone" type="tel" autoComplete="tel" underline />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="signup-email">{copy.emailLabel}</FieldLabel>
        <FieldInput
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          underline
        />
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="signup-password">{copy.passwordLabel}</FieldLabel>
        <FieldInput
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          underline
        />
      </div>
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert variant="success">{state.success}</Alert> : null}
      <SubmitButton idle={copy.submit} pending={copy.pendingSubmit} />
    </form>
  );
}
