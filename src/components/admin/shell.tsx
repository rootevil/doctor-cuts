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

  return (
    <>
      {/* Avoid marketing header/footer flash before hydration. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.body.dataset.admin="true"`,
        }}
      />
      {children}
    </>
  );
}
