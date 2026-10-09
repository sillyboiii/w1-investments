"use client";

import { useState } from "react";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";

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

function LinkedInIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function FilledNode({ member }: { member: TeamMember }) {
  const [open, setOpen] = useState(false);
  const roleLabel = member.displayRole || member.role || member.group;

  return (
    <button
      onClick={() => setOpen(!open)}
      className="mx-auto w-full max-w-sm border-y border-border bg-background py-4 px-4 text-center transition-colors hover:border-ink/40"
    >
      <div className="flex flex-col items-center">
        {member.photo && (
          <div
            className="mb-3 h-16 w-16 rounded-full bg-cover bg-center grayscale-[5%] saturate-[0.9] ring-1 ring-border"
            style={{ backgroundImage: `url('${urlFor(member.photo).width(128).height(128).fit("crop").url()}')` }}
          />
        )}
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted">{roleLabel}</p>
        <h3 className="mt-1 text-lg font-serif tracking-tight text-ink">{member.name}</h3>
        {open && (
          <div className="mt-2 flex flex-col items-center">
            {member.bio && <p className="text-[11px] leading-relaxed text-muted max-w-xs">{member.bio}</p>}
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted hover:text-ink"
              >
                <LinkedInIcon /> LinkedIn
              </a>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

function OpenNode({ member }: { member: TeamMember }) {
  const roleLabel = member.displayRole || member.role || "Open position";
  return (
    <Link href="/join" className="mx-auto block w-full max-w-sm border-y border-border bg-background py-4 px-4 text-center transition-colors hover:border-ink/40 hover:text-ink">
      <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Open position</p>
      <h3 className="mt-1 text-lg font-serif tracking-tight text-ink">{roleLabel}</h3>
      <p className="mt-1 text-[11px] text-muted">Click to apply</p>
    </Link>
  );
}

function Node({ member }: { member: TeamMember }) {
  return member.status === "open" ? <OpenNode member={member} /> : <FilledNode member={member} />;
}

function Connector() {
  return <div className="mx-auto h-8 w-px bg-border" />;
}

function findByRole(members: TeamMember[], roles: string[]) {
  return members.find((m) => roles.includes(m.role || ""));
}

function getResearchBySubgroup(members: TeamMember[], sg: string) {
  return members.filter((m) => m.group === "research" && m.subGroup === sg);
}

export default function TeamOrg({ members }: { members: TeamMember[] }) {
  const founder = findByRole(members, ["founder-president"]);
  const vp = findByRole(members, ["vice-president"]);
  const cio = findByRole(members, ["cio-head-investments"]);

  const headFund = findByRole(members, ["head-fundamental"]);
  const headMacro = findByRole(members, ["head-macro"]);
  const headQuant = findByRole(members, ["head-quant"]);
  const headDigital = findByRole(members, ["head-digital-assets"]);

  const fundamentalAnalysts = getResearchBySubgroup(members, "fundamental").filter((m) => m.role !== "head-fundamental");
  const macroAnalysts = getResearchBySubgroup(members, "macro").filter((m) => m.role !== "head-macro");
  const quantAnalysts = getResearchBySubgroup(members, "quant").filter((m) => m.role !== "head-quant");
  const digitalAnalysts = getResearchBySubgroup(members, "digital-assets").filter((m) => m.role !== "head-digital-assets");

  const platformHeads = members.filter((m) => m.group === "platform" && m.role?.includes("head"));
  const platformOthers = members.filter((m) => m.group === "platform" && !m.role?.includes("head"));

  return (
    <div className="mx-auto max-w-[92rem] px-5 md:px-8 lg:px-10">
      <div className="hidden lg:block border-y border-border py-8">
        <div className="mx-auto max-w-5xl space-y-2">
          {founder && <Node member={founder} />}
          {(vp || cio) && (
            <>
              <Connector />
              <div className="grid grid-cols-2 gap-6">
                <div>{vp && <Node member={vp} />}</div>
                <div>{cio && <Node member={cio} />}</div>
              </div>
            </>
          )}
        </div>

        <Connector />
        <div className="mx-auto h-px max-w-6xl bg-border" />
        <div className="grid grid-cols-4 gap-4 pt-6">
          <div className="space-y-2">
            {headFund && <Node member={headFund} />}
            {fundamentalAnalysts.map((m) => <Node key={m._id} member={m} />)}
          </div>
          <div className="space-y-2">
            {headMacro && <Node member={headMacro} />}
            {macroAnalysts.map((m) => <Node key={m._id} member={m} />)}
          </div>
          <div className="space-y-2">
            {headQuant && <Node member={headQuant} />}
            {quantAnalysts.map((m) => <Node key={m._id} member={m} />)}
          </div>
          <div className="space-y-2">
            {headDigital && <Node member={headDigital} />}
            {digitalAnalysts.map((m) => <Node key={m._id} member={m} />)}
          </div>
        </div>

        <Connector />
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-4">
            {platformHeads.map((m) => <Node key={m._id} member={m} />)}
            {platformOthers.map((m) => <Node key={m._id} member={m} />)}
          </div>
        </div>
      </div>

      <div className="lg:hidden space-y-3 border-y border-border py-6">
        {members.map((m) => <Node key={m._id} member={m} />)}
      </div>
    </div>
  );
}
