import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { sanityClient } from "@/sanity/lib/client";
import { researchBySlugQuery } from "@/sanity/lib/queries";
import { isSanityConfigured } from "@/sanity/env";

interface ResearchPageProps {
  params: Promise<{ slug: string }>;
}

interface ResearchDocument {
  title: string;
  slug: string;
  category?: string;
  analyst?: string;
  publishedAt?: string;
  abstract?: string;
  ticker?: string;
  executiveSummary?: string;
  thesis?: string;
  catalysts?: string;
  risks?: string;
  valuation?: string;
  sources?: string;
  body?: PortableTextBlock[];
  reportUrl?: string;
}

async function getResearch(slug: string): Promise<ResearchDocument | null> {
  if (!isSanityConfigured) return null;
  return sanityClient.fetch(researchBySlugQuery, { slug }, { next: { revalidate: 60 } });
}

function formatDate(date?: string) {
  if (!date) return "Draft";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function ResearchSection({ title, children }: { title: string; children?: string }) {
  if (!children) return null;
  return (
    <section className="border-t border-border pt-8">
      <h2 className="text-2xl md:text-3xl font-serif tracking-tight mb-4">{title}</h2>
      <p className="text-muted leading-relaxed whitespace-pre-line">{children}</p>
    </section>
  );
}

export default async function ResearchArticlePage({ params }: ResearchPageProps) {
  const { slug } = await params;
  const research = await getResearch(slug);

  if (!research) notFound();

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1 pt-24 md:pt-32">
        <article>
          <div className="mx-auto max-w-5xl px-6 md:px-8 lg:px-10">
            <div className="mb-10">
              <div className="mb-5 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted">
                <span>{research.category ?? "Research"}</span>
                {research.ticker && <span>{research.ticker}</span>}
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-[0.98]">
                {research.title}
              </h1>
              <p className="mt-6 text-muted">
                {research.analyst ? `${research.analyst} · ` : ""}{formatDate(research.publishedAt)}
              </p>
              {research.abstract && (
                <p className="mt-8 max-w-3xl text-lg md:text-xl text-muted leading-relaxed">
                  {research.abstract}
                </p>
              )}
              {research.reportUrl && (
                <a
                  href={research.reportUrl}
                  className="mt-8 inline-block border-b border-border pb-1 text-sm hover:border-ink"
                >
                  Download PDF report
                </a>
              )}
            </div>

            <div className="space-y-10 pb-16 md:pb-24">
              <ResearchSection title="Executive Summary">{research.executiveSummary}</ResearchSection>
              <ResearchSection title="Thesis">{research.thesis}</ResearchSection>
              <ResearchSection title="Catalysts">{research.catalysts}</ResearchSection>
              <ResearchSection title="Risks">{research.risks}</ResearchSection>
              <ResearchSection title="Valuation">{research.valuation}</ResearchSection>

              {research.body && research.body.length > 0 && (
                <section className="border-t border-border pt-8 prose prose-neutral max-w-none prose-headings:font-serif prose-p:text-muted prose-p:leading-relaxed">
                  <PortableText value={research.body} />
                </section>
              )}

              <ResearchSection title="Sources">{research.sources}</ResearchSection>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
