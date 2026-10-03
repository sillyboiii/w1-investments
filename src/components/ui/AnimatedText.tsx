"use client";

import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  splitBy?: "words" | "chars";
}

export function AnimatedText({
  text,
  className = "",
  delay = 0,
  duration = 0.8,
  splitBy = "words",
}: AnimatedTextProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

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

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration,
        ease: "easeOut",
      },
    },
  };

  if (prefersReducedMotion === null || prefersReducedMotion) {
    return <div className={className}>{text}</div>;
  }

  if (splitBy === "chars") {
    const chars = text.split("");
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`flex flex-wrap ${className}`}
      >
        {chars.map((char, index) => (
          <motion.span key={index} variants={itemVariants}>
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.div>
    );
  }

  const words = text.split(" ");
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-wrap gap-x-2 ${className}`}
    >
      {words.map((word, index) => (
        <motion.span key={index} variants={itemVariants}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
