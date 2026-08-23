"use client";

// Last-resort fallback when the root layout itself throws. Cannot rely on
// the app's own layout, fonts, or i18n — everything above `<body>` failed.
// Keep this file completely self-contained.

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const digest = "digest" in error ? error.digest : undefined;
    const message = error instanceof Error ? error.message : String(error);
    console.error("[app] global error", { digest, message });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          background: "#090909",
          color: "#f2efe8",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#858585",
              margin: 0,
            }}
          >
            Doctor Cuts
          </p>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              lineHeight: 1.1,
              margin: "1rem 0 0.75rem",
            }}
          >
            Something went wrong.
          </h1>
          <p style={{ color: "rgba(242,239,232,0.8)", margin: "0 0 1.5rem" }}>
            An unexpected error occurred. Reload the page or try again in a
            moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#f2efe8",
              color: "#090909",
              padding: "0.85rem 1.5rem",
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              border: 0,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
