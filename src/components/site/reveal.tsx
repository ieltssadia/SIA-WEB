"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

/** Subtle fade-up reveal on scroll into view. */
export function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

/** Section heading block with serif title and subtitle. */
export function SectionHeading({
  title,
  subtitle,
}: {
  title: ReactNode;
  subtitle?: string;
}) {
  return (
    <Reveal className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
      <h2 className="font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-balance text-[15px] leading-relaxed text-muted-foreground md:text-base">{subtitle}</p>
      ) : null}
    </Reveal>
  );
}
