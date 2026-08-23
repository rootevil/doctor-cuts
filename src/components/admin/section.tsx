export function AdminSection({
  kicker,
  title,
  lead,
  right,
  children,
}: {
  kicker: string;
  title: string;
  lead?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-section">
      <header className="admin-section-header">
        <div className="flex flex-col gap-2">
          <span className="text-label text-accent-soft">{kicker}</span>
          <h1 className="font-display text-3xl leading-none tracking-tight text-display md:text-5xl">
            {title}
          </h1>
          {lead ? <p className="max-w-2xl text-sm text-body">{lead}</p> : null}
        </div>
        {right ? <div className="flex flex-wrap items-center gap-3">{right}</div> : null}
      </header>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
  emphasize,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  emphasize?: boolean;
}) {
  const body = (
    <>
      <span className="text-label">{label}</span>
      <span className="admin-stat-value">{value}</span>
      {hint ? (
        <span className="text-xs text-caption normal-case tracking-normal">{hint}</span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={`admin-stat admin-stat-link ${emphasize ? "is-emphasize" : ""}`}
      >
        {body}
      </a>
    );
  }

  return (
    <div className={`admin-stat ${emphasize ? "is-emphasize" : ""}`}>{body}</div>
  );
}
