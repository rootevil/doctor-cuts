"use client";

import { useEffect, useState } from "react";

export function ScrollAwareHeader({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled ? "true" : "false"}
      className="fixed inset-x-0 top-0 z-40 pt-[var(--safe-top)] transition-[background-color,border-color,backdrop-filter] duration-300 data-[scrolled=true]:border-b data-[scrolled=true]:border-border data-[scrolled=true]:bg-surface/85 data-[scrolled=true]:backdrop-blur-md data-[scrolled=true]:shadow-[0_1px_0_0_color-mix(in_srgb,var(--brass)_12%,transparent)]"
    >
      {children}
    </header>
  );
}
