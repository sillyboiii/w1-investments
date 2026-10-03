"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SlashDivider } from "@/components/ui/SlashDivider";

const categories = [
  "All",
  "Equity Research",
  "Macro",
  "Quantitative",
  "Digital Assets",
  "Market Briefs",
];

const researchItems = [] as const; // Placeholder structure

export default function ResearchPage() {
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
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif tracking-tight leading-[1.05]">
                RESEARCH
              </h1>
              <p className="text-xl md:text-2xl font-serif tracking-tight text-muted mt-4 max-w-3xl">
                A publication-style research hub for rigorous, institutional-standard work.
              </p>

              <SlashDivider delay={0.2} />

              <div className="flex flex-wrap gap-3 md:gap-4">
                {categories.map((category) => (
                  <button
                    key={category}
                    className="text-sm px-3 py-1.5 border border-border hover:border-ink transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <div className="border border-border p-8 md:p-12 text-center">
              <p className="text-sm uppercase tracking-widest text-muted mb-4">
                Research Library
              </p>
              <h3 className="text-xl md:text-2xl font-serif tracking-tight mb-4">
                Content structure ready for publication
              </h3>
              <p className="text-muted max-w-2xl mx-auto">
                Research cards and article templates support title, category, analyst, date, abstract, company/ticker, executive summary, charts, tables, thesis, catalysts, risks, valuation and sources. PDF downloads can be added later.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
