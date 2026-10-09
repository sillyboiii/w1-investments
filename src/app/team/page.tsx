import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { sanityClient } from "@/sanity/lib/client";
import { teamMembersQuery } from "@/sanity/lib/queries";
import { isSanityConfigured } from "@/sanity/env";
import TeamOrgModal from "./team-org-modal";

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

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1 pt-24 md:pt-32">
        <section className="pb-6 md:pb-10">
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

        <section className="pb-12 md:pb-24">
          <TeamOrgModal members={members} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
