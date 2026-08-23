"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

type Props = {
  id: string;
  name: string;
  blurb: string;
  price: string;
  duration: string;
  image: string;
  href?: string;
};

export function ServiceRow({ id, name, blurb, price, duration, image, href }: Props) {
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const rowRef = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();

  const onMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = rowRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  }, []);

  const inner = (
    <div
      ref={rowRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={onMove}
      className="group relative grid grid-cols-[3rem_1fr_auto] items-center gap-6 border-l-2 border-transparent py-8 transition-[padding,border-color] duration-300 md:grid-cols-[4rem_1fr_1fr_auto] md:gap-10 md:py-10 md:hover:border-brass md:hover:pl-4"
    >
      <span className="font-display text-2xl text-muted transition-colors group-hover:text-brass md:text-3xl">
        {id}
      </span>

      <div className="flex flex-col gap-1">
        <span className="font-display text-2xl tracking-tight text-foreground md:text-4xl">
          {name}
        </span>
        <span className="text-sm text-muted md:hidden">{blurb}</span>
      </div>

      <span className="hidden text-sm text-muted md:block">{blurb}</span>

      <div className="flex items-center gap-6 justify-self-end text-right">
        <div className="flex flex-col text-right">
          <span className="text-lg text-foreground md:text-2xl">{price}</span>
          <span className="text-[11px] tracking-[0.28em] text-muted uppercase">
            {duration}
          </span>
        </div>
        <span
          aria-hidden
          className="hidden text-muted transition-transform group-hover:translate-x-1 group-hover:text-foreground md:inline"
        >
          →
        </span>
      </div>

      {!reduce && hovered ? (
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 hidden md:block"
          style={{
            top: pos.y - 130,
            left: pos.x + 40,
            width: 220,
            height: 260,
          }}
        >
          <div className="relative h-full w-full overflow-hidden border border-border transition-colors group-hover:border-brass-muted">
            <Image src={image} alt="" fill sizes="220px" className="object-cover" />
          </div>
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label={name} className="block focus:outline-none">
        {inner}
      </Link>
    );
  }

  return inner;
}
