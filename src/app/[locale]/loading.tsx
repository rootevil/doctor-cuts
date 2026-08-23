// Locale-scoped loading skeleton. Extremely light — this UI shouldn't
// compete with the real page for pixels; a subtle hairline banner is enough
// to signal "we're loading" without flashing chrome.

export default function LocaleLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="pointer-events-none fixed inset-x-0 top-16 z-40 h-px overflow-hidden bg-transparent"
    >
      <div className="h-full w-1/3 animate-pulse bg-brass/60" />
    </div>
  );
}
