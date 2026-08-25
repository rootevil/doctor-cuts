"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { moderateReview } from "@/lib/admin/actions";

export function ReviewFeaturedToggle({
  id,
  locale,
  currentStatus,
  defaultFeatured,
  label,
}: {
  id: string;
  locale: string;
  currentStatus: string;
  defaultFeatured: boolean;
  label: string;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const submit = () => {
    const form = ref.current;
    if (!form) return;
    startTransition(async () => {
      const fd = new FormData(form);
      await moderateReview(fd);
      router.refresh();
    });
  };

  return (
    <form ref={ref} action={moderateReview}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={currentStatus} />
      <label className="flex items-center gap-2 text-[11px] tracking-[0.22em] text-foreground uppercase">
        <input
          type="checkbox"
          name="is_featured"
          defaultChecked={defaultFeatured}
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
