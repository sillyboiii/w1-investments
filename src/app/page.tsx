"use client";

import { motion, type Variants } from "framer-motion";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { SlashDivider } from "@/components/ui/SlashDivider";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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
        <section className="relative min-h-[90vh] md:min-h-[95vh] flex items-center justify-center pt-20">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10 w-full">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center text-center"
            >
              <motion.div variants={itemVariants} className="mb-8 md:mb-10">
                <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl tracking-[-0.03em] leading-[0.95] uppercase font-sans">
                  <span className="font-semibold">W1</span>
                </h1>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6 md:mb-8">
                <AnimatedText
                  text="Building the next generation of investors."
                  className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-serif leading-[1.05] tracking-tight max-w-4xl"
                  splitBy="words"
                  delay={0.3}
                />
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="text-base md:text-lg text-muted max-w-2xl leading-relaxed mb-8 md:mb-10"
              >
                W1 combines investment research, practical experience and education to give students exposure to how investment decisions are actually made.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
              >
                <Button href="/about" variant="primary">
                  Explore W1
                </Button>
                <Button href="/research" variant="secondary">
                  Read Research
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-12 md:mt-16">
                <SlashDivider delay={0.8} />
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-12 md:mb-16"
            >
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif tracking-tight leading-[1.05] max-w-4xl">
                An interconnected ecosystem built around investment research and education
              </h2>
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
                  title: "THE ACADEMY",
                  subtitle: "Developing students into stronger investors and analysts",
                  description:
                    "A structured development pathway that bridges theory with practice, building technical skills through real research work.",
                  href: "/academy",
                },
                {
                  title: "THE PLATFORM",
                  subtitle: "Publishing research, insights and educational content",
                  description:
                    "A serious editorial platform for publishing rigorous research and actionable insights with institutional standards.",
                  href: "/research",
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
                  className="group border border-border bg-background p-8 md:p-10 flex flex-col h-full relative transition-all duration-500 hover:border-ink/30"
                >
                  <div className="mb-6">
                    <h3 className="text-xs font-sans font-medium tracking-[0.2em] uppercase text-muted mb-3">
                      {pillar.title}
                    </h3>
                    <h4 className="text-xl md:text-2xl font-serif tracking-tight mb-4">
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
      </main>
      <Footer />
    </div>
  );
}
