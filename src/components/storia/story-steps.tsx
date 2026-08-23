"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RevealFade } from "@/components/motion/reveal-fade";

const STEP_MS = 4200;

type Step = {
  title: string;
  body: string;
};

type Props = {
  label: string;
  steps: Step[];
};

export function StorySteps({ label, steps }: Props) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce || steps.length < 2) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % steps.length);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [reduce, steps.length]);

  return (
    <section
      className="border-b border-border bg-background"
      aria-labelledby="story-heading"
    >
      <div className="site-wrap-mid py-12 md:py-16">
        <h2
          id="story-heading"
          className="text-[11px] tracking-[0.28em] text-muted uppercase"
        >
          {label}
        </h2>

        <ol className="mt-8 divide-y divide-border border-y border-border">
          {steps.map((step, index) => {
            const isActive = reduce || active === index;
            return (
              <li key={step.title}>
                <RevealFade delay={index * 0.08}>
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    aria-current={isActive ? "step" : undefined}
                    className="group relative grid w-full grid-cols-[auto_1fr] gap-x-5 gap-y-2 py-7 text-left md:gap-x-8 md:py-9"
                  >
                    <span
                      className={`font-display text-2xl tabular-nums transition-colors duration-300 md:text-3xl ${
                        isActive
                          ? "text-brass"
                          : "text-brass-muted/40 group-hover:text-brass-muted"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0">
                      <span
                        className={`block font-display text-2xl leading-tight tracking-tight transition-colors duration-300 md:text-3xl lg:text-[2.35rem] ${
                          isActive
                            ? "text-foreground"
                            : "text-foreground-muted group-hover:text-foreground"
                        }`}
                      >
                        {step.title}
                      </span>

                      <motion.div
                        initial={false}
                        animate={
                          isActive
                            ? { opacity: 1, height: "auto" }
                            : { opacity: 0, height: 0 }
                        }
                        transition={{
                          duration: reduce ? 0 : 0.4,
                          ease: [0.2, 0.7, 0.2, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 max-w-xl text-base text-body md:text-lg">
                          {step.body}
                        </p>
                      </motion.div>
                    </span>

                    {isActive && !reduce ? (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden bg-border"
                      >
                        <motion.span
                          key={active}
                          className="absolute inset-y-0 left-0 bg-brass"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{
                            duration: STEP_MS / 1000,
                            ease: "linear",
                          }}
                        />
                      </span>
                    ) : null}
                  </button>
                </RevealFade>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
