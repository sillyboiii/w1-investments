"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SlashDivider } from "@/components/ui/SlashDivider";

export default function AboutPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1 pt-24 md:pt-32">
        <section>
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif tracking-tight leading-[1.05] max-w-4xl">
                Students shouldn't have to wait until their first internship to experience how investment research and portfolio management actually work.
              </h1>

              <SlashDivider delay={0.2} />

              <div className="max-w-3xl ml-auto space-y-6">
                <p className="text-lg md:text-xl leading-relaxed">
                  W1 exists to create an environment where students can research companies and markets, defend investment ideas, challenge each other's assumptions, manage a model portfolio and publish work they are proud to show employers.
                </p>
                <p className="text-lg md:text-xl leading-relaxed text-muted">
                  Founded by students at the University of Westminster, W1 is built on discipline, rigour and a commitment to institutional standards.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <div className="border-t border-border pt-12">
              <h2 className="text-2xl md:text-4xl font-serif tracking-tight mb-8">
                Philosophy
              </h2>
              <div className="max-w-3xl space-y-6 text-lg leading-relaxed text-muted">
                <p>
                  We believe investment work should be methodical, evidence-based and intellectually honest. Ideas must be defensible, assumptions must be challenged, and conviction must be earned through research.
                </p>
                <p>
                  The sophistication should come from typography, research, information design, photography, whitespace and consistency — not fake financial complexity.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
