import Link from "next/link";
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

async function getResearch(): Promise<ResearchItem[]> {
  if (!isSanityConfigured) return [];
  return sanityClient.fetch(researchListQuery, {}, { next: { revalidate: 60 } });
}

function formatDate(date?: string) {
  if (!date) return "Draft";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function ResearchPage() {
  const researchItems = await getResearch();

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
                  <span
                    key={category}
                    className="text-sm px-3 py-1.5 border border-border text-muted"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            {researchItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {researchItems.map((item) => (
                  <article key={item._id} className="border-t border-border pt-6">
                    {item.coverImage && (
                      <div
                        className="mb-6 aspect-[4/3] bg-cover bg-center grayscale-[10%] saturate-[0.85]"
                        style={{
                          backgroundImage: `url('${urlFor(item.coverImage).width(900).height(675).fit("crop").url()}')`,
                        }}
                      />
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
                      {item.analyst ? `${item.analyst} · ` : ""}{formatDate(item.publishedAt)}
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
                <p>No published research yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
