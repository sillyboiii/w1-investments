"use client";

import { motion } from "framer-motion";
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

const processSteps = [
  {
    step: "01",
    title: "Idea Generation",
    subtitle: "Finding potential opportunities",
    description:
      "Investment ideas can originate from Fundamental, Macro or Quant research. We look for potential mispricing, structural trends, changing industry dynamics or data-driven opportunities worth investigating further.",
  },
  {
    step: "02",
    title: "Preliminary Research",
    subtitle: "Is there something worth investigating?",
    description:
      "The analyst conducts an initial review of the company, industry, financials, valuation and potential catalysts. Weak ideas are filtered out before significant research time is committed.",
  },
  {
    step: "03",
    title: "Deep-Dive Research",
    subtitle: "Understanding the investment",
    description:
      "The analyst studies the business model, competitive position, industry structure, management, financial performance, catalysts and key risks to understand what actually drives the investment.",
  },
  {
    step: "04",
    title: "Modelling & Valuation",
    subtitle: "Turning research into numbers",
    description:
      "Historical financials and forecasts are used to build scenarios and estimate potential value. Appropriate valuation methods are used to understand what assumptions the current market price may reflect.",
  },
  {
    step: "05",
    title: "Investment Thesis",
    subtitle: "Defining why the opportunity exists",
    description:
      "Research is condensed into a clear thesis explaining what the market may be overlooking, why W1's view differs, what could unlock value, the expected time horizon and what could prove the thesis wrong.",
  },
  {
    step: "06",
    title: "Macro & Quant Review",
    subtitle: "Challenging the thesis",
    description:
      "Macro examines the economic and market environment surrounding the idea. Quant tests relevant assumptions using data and evaluates factors such as volatility, correlations and portfolio exposure.",
  },
  {
    step: "07",
    title: "Investment Memorandum",
    subtitle: "Building the complete case",
    description:
      "The analyst brings the research, model, valuation, thesis, catalysts, risks and supporting evidence together into a structured investment memorandum for review.",
  },
  {
    step: "08",
    title: "Investment Committee",
    subtitle: "Defend the idea",
    description:
      "The analyst presents the opportunity to the Investment Committee and faces questions and counterarguments. The committee can Approve, Revise or Reject the proposal.",
  },
  {
    step: "09",
    title: "Portfolio Construction",
    subtitle: "From conviction to position size",
    description:
      "Approved investments are assessed within the context of the entire portfolio. Conviction, downside risk, concentration, correlations and existing exposures help determine an appropriate position size.",
  },
  {
    step: "10",
    title: "Continuous Monitoring",
    subtitle: "The research doesn't stop after investment",
    description:
      "The coverage analyst continues tracking the company, financial results, valuation, catalysts and thesis assumptions. Material developments can trigger another Investment Committee review.",
  },
  {
    step: "11",
    title: "Add / Hold / Trim / Exit",
    subtitle: "Responding as the evidence changes",
    description:
      "Positions are adjusted when expected returns, risk, valuation or the underlying thesis changes. Decisions should follow evidence rather than attachment to the original idea.",
  },
  {
    step: "12",
    title: "Post-Investment Review",
    subtitle: "Learning from the outcome",
    description:
      "After exiting a position, W1 reviews what happened versus the original thesis: what was understood correctly, what was missed and whether the investment process itself can be improved.",
  },
];

const processPhases = [
  {
    phase: "01",
    title: "DISCOVER",
    summary: "Source and filter ideas before serious research time is committed.",
    steps: processSteps.slice(0, 2),
  },
  {
    phase: "02",
    title: "BUILD",
    summary: "Turn promising ideas into a researched thesis, model and valuation view.",
    steps: processSteps.slice(2, 5),
  },
  {
    phase: "03",
    title: "CHALLENGE",
    summary: "Test the thesis through macro, quant and committee scrutiny.",
    steps: processSteps.slice(5, 8),
  },
  {
    phase: "04",
    title: "MANAGE",
    summary: "Translate conviction into portfolio action, then keep reassessing the evidence.",
    steps: processSteps.slice(8),
  },
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
            <p className="text-base md:text-lg text-muted max-w-3xl mb-12">
              The investment process is iterative, with feedback loops between research, risk and committee decisions.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-4 border-y border-border">
              {processPhases.map((phase, index) => (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.9,
                    delay: index * 0.08,
                    ease: "easeOut",
                  }}
                  className="py-7 lg:py-8 lg:px-6 lg:border-l lg:border-border first:lg:border-l-0"
                >
                  <span className="block text-xs font-sans font-medium tracking-[0.25em] text-muted mb-4">
                    {phase.phase}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-serif tracking-tight mb-3">
                    {phase.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed mb-6 max-w-sm">
                    {phase.summary}
                  </p>
                  <div className="space-y-3">
                    {phase.steps.map((step) => (
                      <details key={step.step} className="group border-t border-border pt-3">
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-medium tracking-tight">
                          <span>{step.title}</span>
                          <span className="text-muted transition-transform group-open:rotate-45">+</span>
                        </summary>
                        <p className="mt-2 text-sm font-serif text-muted tracking-tight">
                          {step.subtitle}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {step.description}
                        </p>
                      </details>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="mt-8 text-sm md:text-base text-muted max-w-3xl">
              The process is iterative. New evidence can return an idea to an earlier stage at any point.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
