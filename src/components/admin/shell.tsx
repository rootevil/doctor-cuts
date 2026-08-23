"use client";

import { useEffect } from "react";

/** Marks the document so admin pages can restyle the shared chrome
 *  (solid header, hide marketing footer) without a route-group split. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.dataset.admin = "true";
    return () => {
      delete document.body.dataset.admin;
    };
  }, []);

  return <>{children}</>;
}
