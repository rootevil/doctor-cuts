"use client";

import { motion, useReducedMotion } from "framer-motion";

export function RevealLines({ lines }: { lines: readonly string[] }) {
  const reduce = useReducedMotion();

  return (
    <span className="block">
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className="block overflow-hidden">
          <motion.span
            initial={reduce ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: reduce ? 0 : 0.9,
              delay: reduce ? 0 : 0.15 + index * 0.12,
              ease: [0.2, 0.7, 0.2, 1],
            }}
            className="block"
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
