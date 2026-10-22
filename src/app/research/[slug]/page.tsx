import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ReportPreview } from "@/components/research/ReportPreview";
import { sanityClient } from "@/sanity/lib/client";
import { researchBySlugQuery } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { isSanityConfigured } from "@/sanity/env";

interface ResearchPageProps {
  params: Promise<{ slug: string }>;
}

interface ImageDimensions {
  width?: number;
  height?: number;
}

interface ResearchDocument {
  title: string;
  slug: string;
  category?: string;
  analyst?: string;
  publishedAt?: string;
  abstract?: string;
  ticker?: string;
  body?: PortableTextBlock[];
  coverImage?: Parameters<typeof urlFor>[0];
  coverDimensions?: ImageDimensions | null;
  reportUrl?: string;
  modelUrl?: string;
}

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const image = value as {
        asset?: unknown;
        alt?: string;
        caption?: string;
        dimensions?: ImageDimensions | null;
      };
      if (!image?.asset) return null;
      const width = image.dimensions?.width ?? 1600;
      const height = image.dimensions?.height ?? 900;
      return (
        <figure className="my-10">
          <Image
            src={urlFor(image as Parameters<typeof urlFor>[0])
              .width(Math.min(width, 1600))
              .url()}
            alt={image.alt ?? ""}
            width={width}
            height={height}
            sizes="(min-width: 1024px) 900px, 100vw"
            className="h-auto w-full border border-border"
          />
          {image.caption ? (
            <figcaption className="mt-3 text-xs leading-relaxed text-muted">
              {image.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
  marks: {
    link: ({ value, children }) => {
      const href = (value as { href?: string } | undefined)?.href;
      if (!href) return <>{children}</>;
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  },
};

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

export default async function ResearchArticlePage({ params }: ResearchPageProps) {
  const { slug } = await params;
  const research = await getResearch(slug);

  if (!research) notFound();

  const coverWidth = research.coverDimensions?.width ?? 1500;
  const coverHeight = research.coverDimensions?.height ?? 900;

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
                {research.analyst ? (<><Link href={`/team`} className="hover:text-ink">{research.analyst}</Link> · </>) : ""}
                {formatDate(research.publishedAt)}
              </p>
              {research.abstract && (
                <p className="mt-8 max-w-3xl text-lg md:text-xl text-muted leading-relaxed">
                  {research.abstract}
                </p>
              )}
              {(research.reportUrl || research.modelUrl) && (
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
                  {research.reportUrl && (
                    <a
                      href="#pitch"
                      className="inline-block border-b border-border pb-1 text-sm hover:border-ink"
                    >
                      Preview pitch deck
                    </a>
                  )}
                  {research.reportUrl && (
                    <a
                      href={research.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block border-b border-border pb-1 text-sm hover:border-ink"
                    >
                      Download PDF report
                    </a>
                  )}
                  {research.modelUrl && (
                    <a
                      href={research.modelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block border-b border-border pb-1 text-sm hover:border-ink"
                    >
                      Download financial model
                    </a>
                  )}
                </div>
              )}
            </div>

            {research.reportUrl && (
              <ReportPreview url={research.reportUrl} title={research.title} />
            )}

            <div className="pb-16 md:pb-24 pt-12">
              {research.body && research.body.length > 0 && (
                <section className="border-t border-border pt-10 prose prose-neutral max-w-none prose-headings:font-serif prose-headings:font-normal prose-h2:text-3xl prose-h3:text-2xl prose-p:leading-relaxed prose-a:no-underline prose-a:border-b prose-a:border-border hover:prose-a:border-ink prose-img:my-10">
                  <PortableText value={research.body} components={components} />
                </section>
              )}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
