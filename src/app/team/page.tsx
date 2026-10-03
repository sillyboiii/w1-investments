"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SlashDivider } from "@/components/ui/SlashDivider";

const divisions = [
  {
    name: "Investment",
    roles: [
      "Fundamental Research",
      "Macro Research",
      "Quantitative Research & Portfolio Risk",
      "Digital Assets Research",
    ],
  },
  {
    name: "Platform",
    roles: [
      "Operations",
      "Brand & Creative",
      "Media",
      "Research Publishing",
      "Partnerships",
      "Events",
    ],
  },
  {
    name: "Academy / Training",
    roles: [],
  },
];

export default function TeamPage() {
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
                TEAM
              </h1>
              <p className="text-xl md:text-2xl font-serif tracking-tight text-muted mt-4 max-w-3xl">
                Clean hierarchy with space for profiles.
              </p>

              <SlashDivider delay={0.2} />
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <div className="border border-border p-8 md:p-12">
              <p className="text-sm uppercase tracking-widest text-muted mb-6">
                Team Structure
              </p>
              <div className="space-y-10">
                <div>
                  <h3 className="text-xl md:text-2xl font-serif tracking-tight mb-2">
                    Leadership
                  </h3>
                  <ul className="space-y-2 text-muted">
                    <li>Founder / President</li>
                    <li>Vice President</li>
                    <li>CIO / Head of Investments</li>
                  </ul>
                </div>
                {divisions.map((division) => (
                  <div key={division.name}>
                    <h3 className="text-xl md:text-2xl font-serif tracking-tight mb-3">
                      {division.name}
                    </h3>
                    {division.roles.length > 0 ? (
                      <ul className="space-y-2 text-muted">
                        {division.roles.map((role) => (
                          <li key={role}>{role}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">—</p>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted mt-10 italic">
                Team cards with headshot, name, role, division, bio and LinkedIn are supported by the component system. Profiles will be added as the team forms.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
