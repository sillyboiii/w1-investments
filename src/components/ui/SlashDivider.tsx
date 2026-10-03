"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

interface SlashDividerProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  delay?: number;
}

export function SlashDivider({
  className = "",
  orientation = "horizontal",
  delay = 0,
}: SlashDividerProps) {
  const slashVariants: Variants = {
    hidden: { opacity: 0, scaleX: 0.8 },
    visible: {
      opacity: 1,
      scaleX: 1,
      transition: {
        duration: 1.2,
        delay,
        ease: "easeOut",
      },
    },
  };

  if (orientation === "vertical") {
    return (
      <div className={`hidden md:flex justify-center items-center ${className}`}>
        <motion.svg
          width="24"
          height="120"
          viewBox="0 0 24 120"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          aria-hidden="true"
          className="text-border"
        >
          <motion.path
            d="M 4 20 L 20 100"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            variants={slashVariants}
            fill="none"
          />
        </motion.svg>
      </div>
    );
  }

  return (
    <div className={`hidden md:flex justify-center items-center py-12 md:py-16 ${className}`}>
      <motion.svg
        width="120"
        height="24"
        viewBox="0 0 120 24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        aria-hidden="true"
        className="text-border"
      >
        <motion.path
          d="M 20 4 L 100 20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          variants={slashVariants}
          fill="none"
        />
      </motion.svg>
    </div>
  );
}
