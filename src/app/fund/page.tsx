"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SlashDivider } from "@/components/ui/SlashDivider";

const researchFramework = [
  { title: "Fundamental Research", question: "What should we own?" },
  { title: "Macro Research", question: "What environment are we investing in?" },
  { title: "Quantitative Research", question: "What does the data tell us?" },
  { title: "Portfolio Risk", question: "Where is our risk actually coming from?" },
  { title: "Investment Committee", question: "Given all of the evidence, what do we do?" },
];

export default function FundPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1 pt-24 md:pt-32">
        <section>
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif tracking-tight leading-[1.05]">
                THE FUND
              </h1>
              <p className="text-xl md:text-2xl font-serif tracking-tight text-muted mt-4 max-w-3xl">
                Research and portfolio management.
              </p>

              <SlashDivider delay={0.2} />

              <div className="max-w-3xl ml-auto space-y-6">
                <p className="text-lg md:text-xl leading-relaxed">
                  W1 approaches investment research and portfolio management with discipline, structure and intellectual rigour.
                </p>
                <p className="text-base md:text-lg leading-relaxed text-muted">
                  The Fund operates a global public equities core portfolio, with a separately controlled digital assets research and allocation sleeve. W1 initially operates using a model/simulated portfolio, not real client or university capital.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <h2 className="text-2xl md:text-4xl font-serif tracking-tight mb-10">
              Research Framework
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {researchFramework.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: 1,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  className="border border-border p-6 md:p-8 flex flex-col h-full"
                >
                  <h3 className="text-lg md:text-xl font-serif tracking-tight mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted">{item.question}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 border-t border-border">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <h2 className="text-2xl md:text-4xl font-serif tracking-tight mb-6">
              Investment Process
            </h2>
            <p className="text-base md:text-lg text-muted max-w-3xl mb-10">
              The investment process is iterative, with feedback loops between research, risk and committee decisions — designed to maintain discipline without unnecessary complexity.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex justify-center w-full overflow-x-auto"
            >
              <Image
                src="/process-diagram.png"
                alt="W1 Investment Process Diagram"
                width={1400}
                height={900}
                className="w-full h-auto max-w-6xl"
                priority
              />
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
