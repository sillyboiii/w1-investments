import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { sanityClient } from "@/sanity/lib/client";
import { teamMembersQuery } from "@/sanity/lib/queries";
import { isSanityConfigured } from "@/sanity/env";
import { urlFor } from "@/sanity/lib/image";

interface TeamMember {
  _id: string;
  name?: string;
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

function LinkedInIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function FilledMemberCard({ member }: { member: TeamMember }) {
  const hasPhoto = member.photo;
  return (
    <div className="border-y border-border py-5">
      <div className="flex flex-col items-center text-center">
        {hasPhoto && (
          <div
            className="mb-4 h-24 w-24 rounded-full bg-cover bg-center grayscale-[5%] saturate-[0.9] ring-1 ring-border"
            style={{
              backgroundImage: `url('${urlFor(member.photo).width(192).height(192).fit("crop").url()}')`,
            }}
          />
        )}
        <p className="text-xs uppercase tracking-[0.22em] text-muted">{member.role || member.subGroup || "Team"}</p>
        <h3 className="mt-2 text-xl font-serif tracking-tight text-ink">{member.name}</h3>
        {member.bio && (
          <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-muted">{member.bio}</p>
        )}
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 border-b border-border pb-1 text-xs text-muted hover:border-ink hover:text-ink"
          >
            <LinkedInIcon />
            LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}

function OpenMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="border-y border-border py-5">
      <div className="flex flex-col items-center text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">{member.role || "Open position"}</p>
        <h3 className="mt-2 text-xl font-serif tracking-tight text-ink">Open position</h3>
        <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-muted">
          Profile, LinkedIn, course, research interests and selected W1 work will be added once appointed.
        </p>
        <Link href="/join" className="mt-3 inline-block border-b border-border pb-1 text-xs text-muted hover:border-ink hover:text-ink">
          Recruit for this role
        </Link>
      </div>
    </div>
  );
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {leadership.map((member) => (
                  member.status === "open" ? <OpenMemberCard key={member._id} member={member} /> : <FilledMemberCard key={member._id} member={member} />
                ))}
              </div>
            </div>
          </section>
        )}

        {research.length > 0 && (
          <section className="pb-10 md:pb-14">
            <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
              <h2 className="mb-6 text-xs uppercase tracking-[0.25em] text-muted">Research</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {research.map((member) => (
                  member.status === "open" ? <OpenMemberCard key={member._id} member={member} /> : <FilledMemberCard key={member._id} member={member} />
                ))}
              </div>
            </div>
          </section>
        )}

        {platform.length > 0 && (
          <section className="pb-14 md:pb-20">
            <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
              <h2 className="mb-6 text-xs uppercase tracking-[0.25em] text-muted">Platform & Operations</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {platform.map((member) => (
                  member.status === "open" ? <OpenMemberCard key={member._id} member={member} /> : <FilledMemberCard key={member._id} member={member} />
                ))}
              </div>
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
