"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

const leadership = [
  {
    name: "Adam",
    role: "Founder & President",
    detail: "Finance BSc · University of Westminster",
  },
  {
    name: "Vice President",
    role: "Vice President",
    detail: "University of Westminster",
  },
];

const functions = [
  {
    name: "Fundamental Research",
    description: "Company analysis, financial modelling, valuation and investment theses.",
  },
  {
    name: "Macro Research",
    description: "Economic regimes, rates, currencies, commodities and broader market conditions.",
  },
  {
    name: "Quantitative Research & Portfolio Risk",
    description: "Data-driven research, systematic testing, portfolio exposures and risk analysis.",
  },
  {
    name: "Digital Assets Research",
    description: "Digital assets, market structure, token economics and on-chain ecosystems.",
  },
];

export default function TeamPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative min-h-[70vh] overflow-hidden bg-background pt-28 md:pt-32">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative z-10 mx-auto flex min-h-[48vh] max-w-5xl flex-col items-center justify-center text-center"
            >
              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted">Team</p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-[0.98] text-ink">
                Built by students.
                <br />
                Driven by research.
              </h1>
              <p className="mt-8 max-w-2xl text-base md:text-lg text-muted leading-relaxed">
                W1 brings together students who research markets, challenge investment ideas and help build the operating system of a serious student-led fund.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="border-t border-border bg-background py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <div className="mb-14 flex flex-col justify-between gap-8 border-t border-border pt-8 md:flex-row md:items-end">
              <h2 className="text-3xl md:text-5xl font-serif tracking-tight leading-[1.05] max-w-3xl">
                Meet the team building W1.
              </h2>
              <div className="text-sm text-muted">Leadership</div>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              {leadership.map((member) => (
                <article key={member.name} className="border-t border-border pt-6">
                  <h3 className="text-3xl md:text-4xl font-serif tracking-tight leading-none">
                    {member.name}
                  </h3>
                  <p className="mt-3 text-sm uppercase tracking-[0.2em] text-muted">{member.role}</p>
                  <p className="mt-3 text-muted">{member.detail}</p>
                  <a className="mt-5 inline-block border-b border-border pb-1 text-sm hover:border-ink" href="#">
                    LinkedIn →
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background py-16 md:py-24 border-t border-border">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <h2 className="text-2xl md:text-4xl font-serif tracking-tight mb-10">
              Investment Functions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 border-y border-border">
              {functions.map((item, index) => (
                <div
                  key={item.name}
                  className={`py-7 md:p-8 ${index % 2 === 1 ? "md:border-l" : ""} ${index > 1 ? "md:border-t" : ""} border-border`}
                >
                  <h3 className="text-lg md:text-xl font-serif tracking-tight mb-3">{item.name}</h3>
                  <p className="text-muted leading-relaxed max-w-md">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ink text-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-10 md:gap-16">
              <h2 className="text-3xl md:text-5xl font-serif tracking-tight leading-[1.05]">
                Investment decisions are challenged collectively.
              </h2>
              <div>
                <p className="text-white/75 leading-relaxed mb-8">
                  Researched ideas are presented to the Investment Committee, challenged from multiple perspectives and either approved, revised or rejected.
                </p>
                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-white/80">
                  <span>Approved</span>
                  <span>/</span>
                  <span>Revised</span>
                  <span>/</span>
                  <span>Rejected</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <div className="border-t border-border pt-10">
              <h2 className="text-3xl md:text-5xl font-serif tracking-tight mb-6">Help build W1.</h2>
              <p className="text-muted mb-8 max-w-2xl">
                Fundamental · Macro · Quant · Digital Assets · Platform / Operations
              </p>
              <Button href="/join" variant="primary">Explore Opportunities →</Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
