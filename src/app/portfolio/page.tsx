"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SlashDivider } from "@/components/ui/SlashDivider";

export default function PortfolioPage() {
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
                PORTFOLIO
              </h1>
              <p className="text-xl md:text-2xl font-serif tracking-tight text-muted mt-4">
                Model Portfolio
              </p>

              <SlashDivider delay={0.2} />

              <div className="max-w-3xl ml-auto space-y-6">
                <p className="text-lg md:text-xl leading-relaxed">
                  Architecture in place for a model portfolio. Data integration will follow once the portfolio and risk framework is finalised.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <div className="border border-border p-8 md:p-12 text-center">
              <p className="text-sm uppercase tracking-widest text-muted mb-4">
                Portfolio Data
              </p>
              <h3 className="text-xl md:text-2xl font-serif tracking-tight mb-4">
                Data states ready for integration
              </h3>
              <p className="text-muted max-w-2xl mx-auto">
                Components prepared for portfolio value, performance, benchmark comparison, holdings, position weights, sector and geographic exposure, risk metrics and recent portfolio changes. No performance or holdings have been fabricated.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
