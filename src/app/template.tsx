"use client";

import { useEffect } from "react";
import { motion } from "motion/react";

// Skip the animation on the first page load so server HTML paints immediately;
// animate only client-side route changes.
let hasNavigated = false;

/** Short fade/slide between routes (spec §7.1). */
export default function Template({ children }: { children: React.ReactNode }) {
  const animateIn = hasNavigated;
  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <motion.div
      initial={animateIn ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
