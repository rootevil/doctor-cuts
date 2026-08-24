"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { signInAction, type AuthState } from "@/lib/auth/actions";
import { Alert } from "@/components/ui/alert";
import { FieldInput, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

function SubmitButton({ idle, pending }: { idle: string; pending: string }) {
  const { pending: isPending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="primary"
      arrow
      disabled={isPending}
      className="auth-form__submit"
    >
      {isPending ? pending : idle}
    </Button>
  );
}

type Props = {
  locale: Locale;
  t: Dictionary;
  nextPath?: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
};

const initial: AuthState = {};

export function SignInForm({
  locale,
  t,
  nextPath,
  showPasswordLabel,
  hidePasswordLabel,
}: Props) {
  const [state, action] = useActionState(signInAction, initial);
  const [showPassword, setShowPassword] = useState(false);
  const copy = t.pages.auth.signIn;

  return (
    <form action={action} className="auth-form" noValidate>
      <input type="hidden" name="locale" value={locale} />
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

      <div className="auth-form__field">
        <FieldLabel htmlFor="signin-email">{copy.emailLabel}</FieldLabel>
        <FieldInput
          id="signin-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          autoFocus
          aria-invalid={state.error ? true : undefined}
          placeholder="name@email.com"
        />
      </div>

      <div className="auth-form__field">
        <FieldLabel htmlFor="signin-password">{copy.passwordLabel}</FieldLabel>
        <div className="auth-form__password">
          <FieldInput
            id="signin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            minLength={6}
            aria-invalid={state.error ? true : undefined}
          />
          <button
            type="button"
            className="auth-form__reveal"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {state.error ? <Alert>{state.error}</Alert> : null}

      <SubmitButton idle={copy.submit} pending={copy.pendingSubmit} />
    </form>
  );
}
