"use client";

import { motion, type HTMLMotionProps } from "motion/react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Fades and slides content in once as it enters the viewport. */
export function Reveal({
  delay = 0,
  y = 24,
  children,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.6, ease: EASE_OUT, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Staggers its <RevealItem> children as the group scrolls into view. */
export function RevealGroup({
  stagger = 0.08,
  children,
  ...props
}: HTMLMotionProps<"div"> & { stagger?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function RevealListItem({ children, ...props }: HTMLMotionProps<"li">) {
  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, x: -8 },
        show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE_OUT } },
      }}
      {...props}
    >
      {children}
    </motion.li>
  );
}
