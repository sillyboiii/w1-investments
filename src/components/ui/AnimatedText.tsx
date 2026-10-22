"use client";

import { useSyncExternalStore } from "react";
import { motion, type Variants } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  once?: boolean;
  splitBy?: "words" | "chars" | "lines";
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMediaQuery(callback: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function usePrefersReducedMotion() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToMediaQuery,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
  const mounted = useSyncExternalStore(
    subscribeToMediaQuery,
    () => true,
    () => false,
  );

  return { prefersReducedMotion, mounted };
}

export function AnimatedText({ text, className = "", delay = 0, once = true, splitBy = "chars" }: AnimatedTextProps) {
  const { prefersReducedMotion, mounted } = usePrefersReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: delay,
      },
    },
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
      },
    },
  };

  const words = text.split(" ");

  if (!mounted || prefersReducedMotion) {
    return (
      <span className={className}>
        {text}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      aria-label={text}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[0.25em] last:mr-0">
          {word.split("").map((char, charIndex) => (
            <motion.span
              key={`${wordIndex}-${charIndex}`}
              variants={childVariants}
              className="inline-block"
              aria-hidden="true"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}
