import Link from "next/link";

type Props = {
  id: string;
  name: string;
  blurb: string;
  price: string;
  href?: string;
  detailsHint?: string;
};

export function ServiceRow({
  id,
  name,
  blurb,
  price,
  href,
  detailsHint,
}: Props) {
  const inner = (
    <div className="group grid grid-cols-[2.75rem_1fr_auto] items-center gap-4 border-l-2 border-transparent py-6 transition-[padding,border-color] duration-300 sm:gap-6 md:grid-cols-[3.5rem_minmax(0,1.2fr)_minmax(0,1fr)_auto] md:gap-8 md:py-7 md:hover:border-brass md:hover:pl-3">
      <span className="font-display text-xl tabular-nums text-brass-muted transition-colors group-hover:text-brass md:text-2xl">
        {id}
      </span>

      <div className="min-w-0 flex flex-col gap-1">
        <span className="font-display text-xl tracking-tight text-foreground sm:text-2xl md:text-[1.75rem]">
          {name}
        </span>
        <span className="text-sm text-muted md:hidden">{blurb}</span>
      </div>

      <span className="hidden text-sm leading-snug text-muted md:block">
        {blurb}
      </span>

      <div className="flex min-w-0 items-center gap-3 justify-self-end text-right sm:gap-6">
        <span className="text-sm tabular-nums text-foreground sm:text-base md:text-lg">
          {price}
        </span>
        <span
          aria-hidden
          className="hidden text-brass-muted transition-transform group-hover:translate-x-1 group-hover:text-brass md:inline"
        >
          →
        </span>
        {detailsHint ? (
          <span className="sr-only">{detailsHint}</span>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`${name}, ${price}${detailsHint ? `. ${detailsHint}` : ""}`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
