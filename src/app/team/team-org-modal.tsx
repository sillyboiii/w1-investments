"use client";

import { useState } from "react";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import {
  RESEARCH_SECTIONS,
  memberGroup,
  memberSubGroup,
  normalizeRole,
  type TeamMember,
} from "./team-utils";

function LinkedInIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function Connector() {
  return <div className="mx-auto h-10 w-px bg-border" />;
}

function FilledNode({ member, onClick }: { member: TeamMember; onClick: () => void }) {
  const roleLabel = member.displayRole || member.role || member.group;
  return (
    <button
      onClick={onClick}
      className="mx-auto w-full max-w-sm border-y border-border bg-background py-5 text-center transition-colors hover:border-ink/60"
    >
      {member.photo ? (
        <span
          className="mx-auto mb-3 block h-16 w-16 rounded-full bg-cover bg-center grayscale-[5%] saturate-[0.9] ring-1 ring-border"
          style={{ backgroundImage: `url('${urlFor(member.photo as Parameters<typeof urlFor>[0]).width(128).height(128).fit("crop").url()}')` }}
        />
      ) : null}
      <p className="text-xs uppercase tracking-[0.22em] text-muted">{roleLabel}</p>
      <h3 className="mt-2 text-xl font-serif tracking-tight text-ink">{member.name}</h3>
      <p className="mt-1 text-xs text-muted">View profile</p>
    </button>
  );
}

function OpenNode({ member }: { member: TeamMember }) {
  const roleLabel = member.displayRole || member.role || "Open position";
  return (
    <Link href="/join" className="mx-auto block w-full max-w-sm border-y border-border bg-background py-5 text-center transition-colors hover:border-ink/60 hover:text-ink">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Open position</p>
      <h3 className="mt-2 text-xl font-serif tracking-tight text-ink">{roleLabel}</h3>
      <p className="mt-1 text-xs text-muted">Click to apply</p>
    </Link>
  );
}

function Node({ member, onClick }: { member: TeamMember; onClick: () => void }) {
  return member.status === "open" ? <OpenNode member={member} /> : <FilledNode member={member} onClick={onClick} />;
}

function MemberList({ members, onSelect }: { members: TeamMember[]; onSelect: (m: TeamMember) => void }) {
  return (
    <div className="mt-3 space-y-2">
      {members.map((m) => (
        <Node key={m._id} member={m} onClick={() => onSelect(m)} />
      ))}
    </div>
  );
}

export default function TeamOrgModal({ members }: { members: TeamMember[] }) {
  const [selected, setSelected] = useState<TeamMember | null>(null);

  const byRole = (r: string) => members.find((m) => normalizeRole(m.role) === r);

  const leadership = members.filter((m) => memberGroup(m) === "leadership");
  const founder = byRole("founder-president") ?? leadership[0];
  const vp = byRole("vice-president");
  const cio = byRole("cio-head-investments");
  const leadershipPair = [vp, cio].filter((m): m is TeamMember => Boolean(m) && m !== founder);
  const otherLeadership = leadership.filter((m) => m !== founder && m !== vp && m !== cio);

  const research = members.filter((m) => memberGroup(m) === "research");
  const platform = members.filter((m) => memberGroup(m) === "platform");
  const unclassified = members.filter((m) => !memberGroup(m));

  const sections = RESEARCH_SECTIONS.map((s) => ({
    label: s.label,
    members: research.filter((m) => memberSubGroup(m) === s.key),
  })).filter((s) => s.members.length > 0);

  const columns: { label: string | null; members: TeamMember[] }[] = [
    ...sections,
    ...(platform.length > 0 ? [{ label: "Platform / Operations", members: platform }] : []),
    ...(unclassified.length > 0 ? [{ label: "Team", members: unclassified }] : []),
  ];

  if (members.length === 0) {
    return (
      <div className="mx-auto max-w-[92rem] px-5 md:px-8 lg:px-10">
        <div className="border-y border-border py-16 text-center">
          <p className="text-sm text-muted">Team profiles are coming soon.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-[92rem] px-5 md:px-8 lg:px-10">
        <div className="hidden lg:block border-y border-border py-10">
          <div className="mx-auto max-w-4xl">
            {founder && <Node member={founder} onClick={() => setSelected(founder)} />}

            {leadershipPair.length > 0 && (
              <>
                <Connector />
                <div
                  className="grid gap-6"
                  style={{ gridTemplateColumns: `repeat(${leadershipPair.length}, minmax(0, 1fr))` }}
                >
                  {leadershipPair.map((m) => (
                    <Node key={m._id} member={m} onClick={() => setSelected(m)} />
                  ))}
                </div>
              </>
            )}

            {otherLeadership.length > 0 && (
              <>
                <Connector />
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
                >
                  {otherLeadership.map((m) => (
                    <Node key={m._id} member={m} onClick={() => setSelected(m)} />
                  ))}
                </div>
              </>
            )}
          </div>

          {columns.length > 0 && (
            <>
              <Connector />
              <div className="mx-auto h-px max-w-6xl bg-border" />
              <div
                className="mx-auto grid max-w-6xl gap-6 pt-8"
                style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
              >
                {columns.map((col, i) => (
                  <div key={col.label ?? `col-${i}`} className="border-t border-border pt-5">
                    {col.label && (
                      <p className="mb-3 min-h-8 text-xs uppercase tracking-[0.2em] text-muted">{col.label}</p>
                    )}
                    <MemberList members={col.members} onSelect={setSelected} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="lg:hidden space-y-3 border-y border-border py-6">
          {members.length === 0 ? (
            <p className="text-center text-sm text-muted">Team profiles coming soon.</p>
          ) : (
            members.map((m) => <Node key={m._id} member={m} onClick={() => setSelected(m)} />)
          )}
        </div>
      </div>

      {selected && selected.status !== "open" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md border border-border bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              {selected.photo ? (
                <div
                  className="mb-4 h-24 w-24 rounded-full bg-cover bg-center grayscale-[5%] saturate-[0.9] ring-1 ring-border"
                  style={{ backgroundImage: `url('${urlFor(selected.photo as Parameters<typeof urlFor>[0]).width(192).height(192).fit("crop").url()}')` }}
                />
              ) : null}
              <p className="text-xs uppercase tracking-[0.22em] text-muted">{selected.displayRole || selected.role}</p>
              <h3 className="mt-2 text-2xl font-serif tracking-tight text-ink">{selected.name}</h3>
              {selected.bio && <p className="mt-3 text-sm leading-relaxed text-muted">{selected.bio}</p>}
              {selected.linkedin && (
                <a
                  href={selected.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 border-b border-border pb-1 text-sm text-muted hover:border-ink hover:text-ink"
                >
                  <LinkedInIcon /> LinkedIn
                </a>
              )}
              <button onClick={() => setSelected(null)} className="mt-5 text-xs text-muted hover:text-ink">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
