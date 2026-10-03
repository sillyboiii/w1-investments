"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

const leadership = [
  {
    label: "Founder / President",
    name: "Adam",
    role: "Founder & President",
    status: "filled",
  },
  {
    label: "Vice President",
    name: "Open position",
    role: "Vice President",
    status: "open",
  },
  {
    label: "CIO / Head of Investments",
    name: "Open position",
    role: "CIO / Head of Investments",
    status: "open",
  },
];

const researchFunctions = [
  {
    name: "Fundamental Research",
    lead: "Head of Fundamental Research",
    roles: ["Sector Heads", "Equity Analysts", "Analyst Trainees"],
  },
  {
    name: "Macro Research",
    lead: "Head of Macro",
    roles: ["Macro Analysts", "Analyst Trainees"],
  },
  {
    name: "Quantitative Research + Portfolio Risk",
    lead: "Head of Quant",
    roles: ["Quantitative Research", "Portfolio Risk", "Quantitative Analyst Trainees"],
  },
  {
    name: "Digital Assets Research",
    lead: "Head of Digital Assets",
    roles: ["Digital Asset Analysts", "Analyst Trainees"],
  },
];

const platformRoles = [
  "Head of Operations / Platform",
  "Operations",
  "Brand & Creative",
  "Media / Social",
  "Research Publishing",
  "Partnerships & Events",
];

function OpenPosition({ title }: { title: string }) {
  return (
    <Link
      href="/join"
      className="block border-t border-border pt-3 text-sm text-muted transition-colors hover:text-ink"
    >
      <span className="block text-xs uppercase tracking-[0.2em] text-muted">Open position</span>
      <span className="mt-1 block font-medium text-foreground">{title}</span>
    </Link>
  );
}

function LeadershipNode({ item }: { item: (typeof leadership)[number] }) {
  return (
    <div className="mx-auto w-full max-w-sm border-y border-border bg-background py-5 text-center">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">{item.label}</p>
      <h3 className="mt-3 text-2xl font-serif tracking-tight text-ink">{item.name}</h3>
      <p className="mt-2 text-sm text-muted">{item.role}</p>
      {item.status === "open" && (
        <Link href="/join" className="mt-3 inline-block border-b border-border pb-1 text-xs text-muted hover:border-ink hover:text-ink">
          Recruit for this role
        </Link>
      )}
    </div>
  );
}

function Connector() {
  return <div className="mx-auto h-10 w-px bg-border" />;
}

export default function TeamPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <section className="pt-28 md:pt-32 pb-10 md:pb-14">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="max-w-4xl"
            >
              <p className="mb-5 text-xs uppercase tracking-[0.25em] text-muted">Team</p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-[0.98] text-ink">
                The people behind W1.
              </h1>
              <p className="mt-7 max-w-2xl text-base md:text-lg text-muted leading-relaxed">
                W1 brings together students across investment research, portfolio management and operations within one investment process.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="pb-16 md:pb-24">
          <div className="mx-auto max-w-[92rem] px-6 md:px-8 lg:px-10">
            <div className="hidden lg:block border-y border-border py-10">
              <div className="mx-auto max-w-5xl">
                {leadership.map((item, index) => (
                  <div key={item.label}>
                    <LeadershipNode item={item} />
                    {index < leadership.length - 1 && <Connector />}
                  </div>
                ))}
              </div>

              <Connector />
              <div className="mx-auto h-px max-w-6xl bg-border" />
              <div className="grid grid-cols-5 gap-6 pt-8">
                {researchFunctions.map((group) => (
                  <div key={group.name} className="border-t border-border pt-5">
                    <p className="min-h-12 text-xs uppercase tracking-[0.2em] text-muted">{group.name}</p>
                    <OpenPosition title={group.lead} />
                    <div className="mt-5 space-y-2 text-sm text-muted">
                      {group.roles.map((role) => (
                        <div key={role} className="border-t border-border pt-2">{role}</div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="border-t border-border pt-5">
                  <p className="min-h-12 text-xs uppercase tracking-[0.2em] text-muted">Platform / Operations</p>
                  <OpenPosition title={platformRoles[0]} />
                  <div className="mt-5 space-y-2 text-sm text-muted">
                    {platformRoles.slice(1).map((role) => (
                      <div key={role} className="border-t border-border pt-2">{role}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:hidden space-y-4 border-y border-border py-6">
              <details open className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                <summary className="cursor-pointer list-none text-sm uppercase tracking-[0.2em] text-muted">Leadership</summary>
                <div className="mt-5 space-y-5">
                  {leadership.map((item) => <LeadershipNode key={item.label} item={item} />)}
                </div>
              </details>

              <details className="border-t border-border pt-4">
                <summary className="cursor-pointer list-none text-sm uppercase tracking-[0.2em] text-muted">Investment Function</summary>
                <div className="mt-5 space-y-6">
                  {researchFunctions.map((group) => (
                    <div key={group.name} className="border-t border-border pt-4">
                      <h3 className="font-serif text-xl tracking-tight">{group.name}</h3>
                      <OpenPosition title={group.lead} />
                      <div className="mt-4 space-y-2 text-sm text-muted">
                        {group.roles.map((role) => <div key={role}>{role}</div>)}
                      </div>
                    </div>
                  ))}
                </div>
              </details>

              <details className="border-t border-border pt-4">
                <summary className="cursor-pointer list-none text-sm uppercase tracking-[0.2em] text-muted">Platform / Operations</summary>
                <div className="mt-5 space-y-2 text-sm text-muted">
                  {platformRoles.map((role, index) => (
                    index === 0 ? <OpenPosition key={role} title={role} /> : <div key={role}>{role}</div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </section>

        <section className="border-t border-border py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.4fr] gap-10 md:gap-16">
              <h2 className="text-3xl md:text-5xl font-serif tracking-tight leading-[1.05]">
                Investment decisions are challenged collectively.
              </h2>
              <div>
                <p className="text-muted leading-relaxed mb-8 max-w-2xl">
                  The Investment Committee brings together senior members of W1 to review research, challenge assumptions and determine whether an investment should be approved, revised or rejected.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border text-xs uppercase tracking-[0.2em] text-muted">
                  {['Present', 'Challenge', 'Revise', 'Decide'].map((step, index) => (
                    <div key={step} className={`py-4 ${index > 0 ? 'md:border-l' : ''} border-border`}>
                      {step}
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm text-muted leading-relaxed max-w-2xl">
                  The President, Vice President, CIO and relevant research heads can sit on the Investment Committee depending on the investment being discussed.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <h2 className="text-3xl md:text-5xl font-serif tracking-tight leading-[1.05] max-w-3xl">
                Current members.
              </h2>
              <p className="max-w-md text-sm text-muted">
                Only confirmed W1 members appear as people. Open roles stay marked as open positions until appointed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <details className="group border-y border-border py-5">
                <summary className="cursor-pointer list-none">
                  <div className="aspect-[4/5] bg-stone-200" />
                  <h3 className="mt-5 text-3xl font-serif tracking-tight">Adam</h3>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">Founder & President</p>
                  <p className="mt-2 text-sm text-muted">Leadership</p>
                </summary>
                <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm text-muted leading-relaxed">
                  <p>Founder & President of W1.</p>
                  <p>University: University of Westminster</p>
                  <p>Course: Finance BSc</p>
                  <p>Research interests and selected W1 research will be added once available.</p>
                  <a className="inline-block border-b border-border pb-1 hover:border-ink hover:text-ink" href="#">LinkedIn</a>
                </div>
              </details>
            </div>

            <div className="mt-16 border-t border-border pt-10">
              <h2 className="text-3xl md:text-5xl font-serif tracking-tight mb-6">Help build W1.</h2>
              <p className="text-muted mb-8 max-w-2xl">
                Fundamental · Macro · Quant · Digital Assets · Platform / Operations
              </p>
              <Button href="/join" variant="primary">Explore Opportunities</Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
