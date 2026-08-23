"use client";

import { useRef, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toggleServiceActive } from "@/lib/admin/actions";

export function ServiceActiveToggle({
  id,
  locale,
  defaultChecked,
  label,
}: {
  id: string;
  locale: string;
  defaultChecked: boolean;
  label: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    const form = formRef.current;
    if (!form) return;
    startTransition(async () => {
      const fd = new FormData(form);
      await toggleServiceActive(fd);
    });
  };

  return (
    <form ref={formRef} action={toggleServiceActive} className="flex items-center gap-2">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={id} />
      <label className="flex items-center gap-2 text-[11px] tracking-[0.22em] text-foreground uppercase">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={defaultChecked}
          onChange={submit}
          disabled={pending}
          className="h-4 w-4 accent-brass"
        />
        {label}
        {pending ? <Loader2 className="h-3 w-3 animate-spin text-muted" aria-hidden /> : null}
      </label>
    </form>
  );
}
