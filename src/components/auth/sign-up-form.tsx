"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { signUpAction, type AuthState } from "@/lib/auth/actions";
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

const initial: AuthState = {};

export function SignUpForm({
  locale,
  t,
  showPasswordLabel,
  hidePasswordLabel,
}: {
  locale: Locale;
  t: Dictionary;
  showPasswordLabel: string;
  hidePasswordLabel: string;
}) {
  const [state, action] = useActionState(signUpAction, initial);
  const [showPassword, setShowPassword] = useState(false);
  const copy = t.pages.auth.signUp;

  return (
    <form action={action} className="auth-form" noValidate>
      <input type="hidden" name="locale" value={locale} />

      <div className="auth-form__grid">
        <div className="auth-form__field">
          <FieldLabel htmlFor="signup-name">{copy.nameLabel}</FieldLabel>
          <FieldInput
            id="signup-name"
            name="full_name"
            type="text"
            autoComplete="name"
            autoFocus
          />
        </div>
        <div className="auth-form__field">
          <FieldLabel htmlFor="signup-phone">{copy.phoneLabel}</FieldLabel>
          <FieldInput
            id="signup-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
          />
        </div>
      </div>

      <div className="auth-form__field">
        <FieldLabel htmlFor="signup-email">{copy.emailLabel}</FieldLabel>
        <FieldInput
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="name@email.com"
        />
      </div>

      <div className="auth-form__field">
        <FieldLabel htmlFor="signup-password">{copy.passwordLabel}</FieldLabel>
        <div className="auth-form__password">
          <FieldInput
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
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
      {state.success ? <Alert variant="success">{state.success}</Alert> : null}

      <SubmitButton idle={copy.submit} pending={copy.pendingSubmit} />
    </form>
  );
}
