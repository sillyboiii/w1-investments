"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SlashDivider } from "@/components/ui/SlashDivider";

const progression = [
  { title: "Applicant" },
  { title: "Academy" },
  { title: "Analyst Trainee" },
  { title: "Analyst" },
  { title: "Senior Analyst" },
  { title: "Sector Head" },
];

const curriculum = [
  "Accounting fundamentals",
  "Financial statements",
  "Industry research",
  "Investment thesis construction",
  "Financial modelling",
  "Valuation",
  "Portfolio management",
  "Investment pitching",
];

const tracks = ["Fundamental", "Macro", "Quant"];

export default function AcademyPage() {
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
                W1 ACADEMY
              </h1>
              <p className="text-xl md:text-2xl font-serif tracking-tight text-muted mt-4 max-w-3xl">
                Developing students into stronger investors and analysts.
              </p>

              <SlashDivider delay={0.2} />

              <div className="max-w-3xl ml-auto space-y-6">
                <p className="text-lg md:text-xl leading-relaxed">
                  The Academy provides a structured development pathway that allows students to learn while maintaining the standards required for investment work.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <h2 className="text-2xl md:text-4xl font-serif tracking-tight mb-8">
              Development Pathway
            </h2>
            <div className="flex flex-wrap gap-3 md:gap-4 mb-12">
              {progression.map((step, index) => (
                <div key={step.title} className="flex items-center gap-3">
                  <div className="border border-border px-4 py-2 text-sm md:text-base">
                    {step.title}
                  </div>
                  {index < progression.length - 1 && (
                    <span className="text-muted">→</span>
                  )}
                </div>
              ))}
            </div>

            <h2 className="text-2xl md:text-4xl font-serif tracking-tight mb-8">
              Core Curriculum
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {curriculum.map((item) => (
                <div key={item} className="border border-border p-4 text-sm md:text-base">
                  {item}
                </div>
              ))}
            </div>

            <h2 className="text-2xl md:text-4xl font-serif tracking-tight mb-8">
              Specialist Tracks
            </h2>
            <div className="flex flex-wrap gap-4">
              {tracks.map((track) => (
                <div key={track} className="border border-border px-6 py-3 font-serif text-lg">
                  {track}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
