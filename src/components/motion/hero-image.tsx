"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function HeroImage({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 -z-20"
      initial={reduce ? { scale: 1 } : { scale: 1.05 }}
      animate={{ scale: 1 }}
      transition={{ duration: reduce ? 0 : 1.6, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
