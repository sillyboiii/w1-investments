import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { sanityClient } from "@/sanity/lib/client";
import { teamMembersQuery } from "@/sanity/lib/queries";
import { isSanityConfigured } from "@/sanity/env";
import { urlFor } from "@/sanity/lib/image";
import TeamGrid from "./team-grid";

interface TeamMember {
  _id: string;
  name?: string;
  displayRole?: string;
  role?: string;
  group?: string;
  subGroup?: string;
  status?: "filled" | "open";
  order?: number;
  linkedin?: string;
  photo?: any;
  bio?: string;
}

async function getTeamMembers(): Promise<TeamMember[]> {
  if (!isSanityConfigured) return [];
  return sanityClient.fetch(teamMembersQuery, {}, { next: { revalidate: 60 } });
}

export default async function TeamPage() {
  const members = await getTeamMembers();

  const leadership = members.filter((m) => m.group === "leadership").sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const research = members.filter((m) => m.group === "research").sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const platform = members.filter((m) => m.group === "platform").sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1 pt-24 md:pt-32">
        <section className="pb-10 md:pb-16">
          <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
            <div className="max-w-4xl">
              <p className="mb-5 text-xs uppercase tracking-[0.25em] text-muted">Team</p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-[1.02] md:leading-[0.98] text-ink">
                The people behind W1.
              </h1>
              <p className="mt-5 md:mt-7 max-w-2xl text-base md:text-lg text-muted leading-relaxed">
                W1 brings together students across investment research, portfolio management and operations within one investment process.
              </p>
            </div>
          </div>
        </section>

        {leadership.length > 0 && (
          <section className="pb-10 md:pb-14">
            <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
              <h2 className="mb-6 text-xs uppercase tracking-[0.25em] text-muted">Leadership</h2>
              <TeamGrid members={leadership} />
            </div>
          </section>
        )}

        {research.length > 0 && (
          <section className="pb-10 md:pb-14">
            <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
              <h2 className="mb-6 text-xs uppercase tracking-[0.25em] text-muted">Research</h2>
              <TeamGrid members={research} />
            </div>
          </section>
        )}

        {platform.length > 0 && (
          <section className="pb-14 md:pb-20">
            <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
              <h2 className="mb-6 text-xs uppercase tracking-[0.25em] text-muted">Platform & Operations</h2>
              <TeamGrid members={platform} />
            </div>
          </section>
        )}

        {leadership.length === 0 && research.length === 0 && platform.length === 0 && (
          <section className="pb-14 md:pb-20">
            <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
              <p className="text-muted">No team members added yet.</p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
