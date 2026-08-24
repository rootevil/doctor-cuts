"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function RevealFade({
  children,
  delay = 0,
  y = 12,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? { y: 0, opacity: 1 } : { y, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -40px 0px" }}
      transition={{
        duration: reduce ? 0 : 0.7,
        delay: reduce ? 0 : delay,
        ease: [0.2, 0.7, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
