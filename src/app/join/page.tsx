"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SlashDivider } from "@/components/ui/SlashDivider";
import { W1Mark } from "@/components/ui/W1Mark";

const tracks = [
  "Fundamental Research",
  "Macro Research",
  "Quantitative Research",
  "Digital Assets",
  "Platform",
];

export default function JoinPage() {
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
              <h1 className="flex flex-wrap items-center gap-2 text-3xl md:text-5xl lg:text-6xl font-serif tracking-tight leading-[1.05]">
                JOIN
                <W1Mark size="lg" className="-ml-10 h-auto w-32 md:-ml-14 md:w-44 lg:-ml-16 lg:w-52" />
              </h1>

              <SlashDivider delay={0.2} />

              <div className="max-w-3xl ml-auto space-y-6">
                <p className="text-lg md:text-xl leading-relaxed">
                  W1 offers opportunities across research and platform functions. Applications structure is ready for integration when recruitment opens.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <h2 className="text-2xl md:text-4xl font-serif tracking-tight mb-8">
              Tracks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {tracks.map((track) => (
                <div key={track} className="border border-border p-6">
                  <h3 className="text-lg md:text-xl font-serif tracking-tight">
                    {track}
                  </h3>
                </div>
              ))}
            </div>

            <div className="border border-border p-8 md:p-12">
              <p className="text-sm uppercase tracking-widest text-muted mb-4">
                Recruitment Status
              </p>
              <h3 className="text-xl md:text-2xl font-serif tracking-tight mb-4">
                Applications: currently closed
              </h3>
              <p className="text-muted max-w-2xl">
                This state can be edited without redesigning the page. Application form integration will follow when recruitment opens.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
