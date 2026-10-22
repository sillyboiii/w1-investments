"use client";

import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";

const EASE_OUT: [number, number, number, number] = [0.25, 0.8, 0.25, 1];

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE_OUT },
  },
};

interface RevealProps {
  as?: keyof typeof motion;
  stagger?: boolean;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Reveal({ as = "div", stagger = true, children, className, id }: RevealProps) {
  const [reduce, setReduce] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const M = as === "section" ? motion.section : as === "article" ? motion.article : as === "header" ? motion.header : as === "footer" ? motion.footer : as === "main" ? motion.main : motion.div;

  if (reduce) {
    const Comp = as === "section" ? "section" : as === "article" ? "article" : as === "header" ? "header" : as === "footer" ? "footer" : as === "main" ? "main" : "div";
    return <Comp className={className} id={id}>{children}</Comp>;
  }

  return (
    <M
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger ? container : undefined}
      className={className}
      id={id}
    >
      {stagger
        ? Array.isArray(children)
          ? children.map((child, i) => (
              <motion.div key={i} variants={item}>
                {child}
              </motion.div>
            ))
          : <motion.div variants={item}>{children}</motion.div>
        : children}
    </M>
  );
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};
