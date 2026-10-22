'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { sanityClient } from "@/sanity/lib/client";
import { researchListQuery } from "@/sanity/lib/queries";
import { isSanityConfigured } from "@/sanity/env";
import { urlFor } from "@/sanity/lib/image";

const categories = [
  "All",
  "Equity Research",
  "Macro",
  "Quantitative",
  "Digital Assets",
  "Market Briefs",
];

interface ResearchItem {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  analyst?: string;
  publishedAt?: string;
  abstract?: string;
  ticker?: string;
  coverImage?: Parameters<typeof urlFor>[0];
  reportUrl?: string;
}

function normalizeCategory(cat?: string) {
  if (!cat) return "Research";
  const c = cat.toLowerCase();
  if (c.includes("macro")) return "Macro";
  if (c.includes("quant")) return "Quantitative";
  if (c.includes("digital")) return "Digital Assets";
  if (c.includes("brief")) return "Market Briefs";
  if (c.includes("equity")) return "Equity Research";
  return cat;
}


function formatDate(date?: string) {
  if (!date) return "Draft";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function ResearchPage() {
  const [researchItems, setResearchItems] = useState<ResearchItem[]>([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!isSanityConfigured) { setLoading(false); return; }
      try {
        const items = await sanityClient.fetch(researchListQuery, {}, { cache: "no-store" });
        setResearchItems(items || []);
      } catch {
        setResearchItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (active === "All") return researchItems;
    return researchItems.filter((item) => {
      const c = normalizeCategory(item.category);
      if (active === "Equity Research") return c === "Equity Research" || c === "Research";
      return c === active;
    });
  }, [researchItems, active]);

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1 pt-24 md:pt-32">
        <section>
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif tracking-tight leading-[1.05]">
                RESEARCH
              </h1>
              <p className="text-xl md:text-2xl font-serif tracking-tight text-muted mt-4 max-w-3xl">
                A publication-style research hub for rigorous, institutional-standard work.
              </p>

              <div className="mt-10 flex flex-wrap gap-3 md:gap-4">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActive(category)}
                    className={`text-sm px-3 py-1.5 border transition-colors ${
                      active === category
                        ? "border-ink text-ink bg-ink/5"
                        : "border-border text-muted hover:border-ink hover:text-ink"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((item) => (
                  <article key={item._id} className="border-t border-border pt-6">
                    {item.coverImage && (
                      <Link
                        href={`/research/${item.slug}`}
                        className="group mb-6 block overflow-hidden border border-border bg-border/20"
                      >
                        <div className="relative aspect-[16/9]">
                          <Image
                            src={urlFor(item.coverImage)
                              .width(1200)
                              .height(675)
                              .fit("crop")
                              .quality(85)
                              .url()}
                            alt={item.title}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                          />
                        </div>
                      </Link>
                    )}
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted">
                      <span>{item.category ?? "Research"}</span>
                      {item.ticker && <span>{item.ticker}</span>}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-serif tracking-tight leading-[1.05]">
                      <Link href={`/research/${item.slug}`} className="hover:opacity-70">
                        {item.title}
                      </Link>
                    </h2>
                    <p className="mt-4 text-sm text-muted">
                      {item.analyst ? (<><Link href={`/team`} className="hover:text-ink">{item.analyst}</Link> · </>) : ""}{formatDate(item.publishedAt)}
                    </p>
                    {item.abstract && (
                      <p className="mt-4 text-muted leading-relaxed">{item.abstract}</p>
                    )}
                    <div className="mt-6 flex items-center gap-5 text-sm">
                      <Link href={`/research/${item.slug}`} className="border-b border-border pb-1 hover:border-ink">
                        Read research
                      </Link>
                      {item.reportUrl && (
                        <a href={item.reportUrl} className="border-b border-border pb-1 hover:border-ink">
                          Download PDF
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="py-10 md:py-14 text-muted">
                <p>{loading ? "Loading..." : "No published research yet."}</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
