"use client";

import { motion, type Variants } from "framer-motion";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { SlashDivider } from "@/components/ui/SlashDivider";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarketTicker } from "@/components/ui/MarketTicker";

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(0, 0, 0, 0.62) 0%, rgba(0, 0, 0, 0.34) 42%, rgba(0, 0, 0, 0.08) 100%), url('https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1920&auto=format&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />

          <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 lg:px-10 w-full flex flex-col justify-center h-full pt-20">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-start"
            >
              <motion.div variants={itemVariants} className="mb-6 md:mb-8">
                <AnimatedText
                  text="Investing through research."
                  className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-serif leading-[1.08] tracking-tight max-w-6xl text-white"
                  splitBy="words"
                  delay={0.3}
                />
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="text-base md:text-lg text-white/80 max-w-2xl leading-relaxed mb-8 md:mb-10"
              >
                W1 is a student-led investment fund researching global markets, developing investment theses and managing a model portfolio.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6"
              >
                <Button href="/fund" variant="primary" className="!bg-white !text-ink !border-white hover:!bg-white/90">
                  Explore the Fund →
                </Button>
                <Button href="/research" variant="secondary" className="!bg-white/10 !text-white !border-white/30 backdrop-blur-sm hover:!bg-white/20 hover:!border-white/50">
                  Read Research
                </Button>
              </motion.div>
            </motion.div>
          </div>

          <MarketTicker />
        </section>

        <section className="bg-background py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-12 md:mb-16"
            >
              <div className="border-t border-border pt-10">
                <p className="text-xs uppercase tracking-[0.25em] text-muted mb-4">
                  01 / THE FUND
                </p>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif tracking-tight leading-[1.05] max-w-4xl">
                  Ideas are challenged before capital is allocated.
                </h2>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {[
                {
                  title: "THE FUND",
                  subtitle: "Research and portfolio management",
                  description:
                    "Conducting disciplined research to inform investment decisions and manage a model portfolio with clear process and risk discipline.",
                  href: "/fund",
                },
                {
                  title: "RESEARCH",
                  subtitle: "Fundamental, Macro, Quant",
                  description:
                    "Generating and challenging investment ideas through multiple perspectives to strengthen conviction before allocation.",
                  href: "/research",
                },
                {
                  title: "PORTFOLIO",
                  subtitle: "Managed with discipline",
                  description:
                    "A model portfolio built and monitored through a structured investment process with deliberate risk management.",
                  href: "/portfolio",
                },
              ].map((pillar, index) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: 1,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  className="group border border-border bg-background p-8 md:p-10 flex flex-col h-full relative transition-all duration-500 hover:border-ink/40 hover:shadow-sm/5"
                >
                  <div className="mb-6">
                    <h3 className="text-xs font-sans font-medium tracking-[0.25em] uppercase text-muted mb-4">
                      {pillar.title}
                    </h3>
                    <h4 className="text-xl md:text-2xl font-serif tracking-tight leading-[1.15] mb-4">
                      {pillar.subtitle}
                    </h4>
                    <p className="text-muted leading-relaxed">{pillar.description}</p>
                  </div>
                  <div className="mt-auto">
                    <Button href={pillar.href} variant="tertiary">
                      Learn more
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-black">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(0, 0, 0, 0.28) 0%, rgba(0, 0, 0, 0.56) 100%), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1920&auto=format&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 lg:px-10 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-2xl md:text-4xl lg:text-5xl font-serif tracking-tight leading-[1.05] text-white max-w-4xl mx-auto"
            >
              Rigorous research. Disciplined decisions. Evidence over assumption.
            </motion.h2>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
