"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

const steps = [
  { step: "Apply", body: "Send the form with your CV and a short note on why W1." },
  { step: "Review", body: "We read every application and shortlist for a conversation." },
  { step: "Interview", body: "A discussion about markets, ideas and how you think." },
  { step: "Decision", body: "We come back to everyone, whichever way it goes." },
];

const TALLY_URL = process.env.NEXT_PUBLIC_TALLY_FORM_URL ?? "";
const CLOSE_AT = process.env.NEXT_PUBLIC_APPLICATIONS_CLOSE_AT ?? "";

function useCountdown(targetIso: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!targetIso) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  const target = targetIso ? Date.parse(targetIso) : NaN;
  if (!targetIso || Number.isNaN(target)) return null;

  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
    expired: diff === 0,
  };
}

function ApplyButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={TALLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-sm bg-ink px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 ${className}`}
    >
      Apply now
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
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </a>
  );
}

function ApplicationsPopup() {
  const [open, setOpen] = useState(false);
  const countdown = useCountdown(CLOSE_AT);

  useEffect(() => {
    if (!TALLY_URL) return;
    if (sessionStorage.getItem("w1-apply-popup") === "1") return;
    const id = setTimeout(() => setOpen(true), 1400);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    sessionStorage.setItem("w1-apply-popup", "1");
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const units = countdown
    ? [
        { label: "Days", value: pad(countdown.days) },
        { label: "Hours", value: pad(countdown.hours) },
        { label: "Mins", value: pad(countdown.minutes) },
        { label: "Secs", value: pad(countdown.seconds) },
      ]
    : [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={close} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Applications open"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md border border-border bg-background p-8 md:p-10"
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 text-muted transition-colors hover:text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Applications</p>
            <h2 className="mt-4 font-serif text-3xl tracking-tight">Now open</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              We&apos;re recruiting across research and platform. It takes a few minutes to apply.
            </p>

            {countdown && (
              <div className="mt-7 grid grid-cols-4 gap-2">
                {units.map((unit) => (
                  <div key={unit.label} className="border-t border-border pt-3">
                    <p className="font-serif text-2xl tabular-nums tracking-tight md:text-3xl">
                      {unit.value}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted">
                      {unit.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {countdown && (
              <p className="mt-3 text-xs text-muted">
                {countdown.expired ? "Applications close today." : "until applications close."}
              </p>
            )}

            <ApplyButton className="mt-8 w-full justify-center" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function JoinPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      {TALLY_URL ? <ApplicationsPopup /> : null}
      <main className="flex-1 pt-24 md:pt-32">
        <section>
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h1 className="flex flex-wrap items-center gap-2 text-3xl md:text-5xl lg:text-6xl font-serif tracking-tight leading-[1.05]">
                JOIN
                <W1Mark size="lg" className="-ml-7 h-auto w-32 md:-ml-10 md:w-44 lg:-ml-12 lg:w-52" />
              </h1>

              <SlashDivider delay={0.2} />

              <div className="max-w-3xl ml-auto space-y-6">
                <p className="text-lg md:text-xl leading-relaxed">
                  W1 offers opportunities across research and platform functions. Applications are
                  open — tell us who you are, what you want to work on, and why.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <h2 className="text-2xl md:text-4xl font-serif tracking-tight mb-8">Tracks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tracks.map((track) => (
                <div key={track} className="border border-border p-6">
                  <h3 className="text-lg md:text-xl font-serif tracking-tight">{track}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-16 md:pb-24">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <div className="border-t border-border pt-8">
              <h2 className="text-2xl md:text-4xl font-serif tracking-tight">Process</h2>
              <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                {steps.map((item, index) => (
                  <div key={item.step}>
                    <span className="text-xs tabular-nums text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 font-serif text-xl tracking-tight">{item.step}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20 md:pb-28">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <div className="flex flex-col gap-6 border border-border p-8 sm:flex-row sm:items-center sm:justify-between md:p-12">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Applications</p>
                <h3 className="mt-3 font-serif text-2xl tracking-tight md:text-3xl">
                  {TALLY_URL ? "Applications are open." : "Opening shortly."}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                  {TALLY_URL
                    ? "Apply through our form — it takes a few minutes."
                    : "The form will open here shortly."}
                </p>
              </div>
              {TALLY_URL ? <ApplyButton className="shrink-0" /> : null}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
