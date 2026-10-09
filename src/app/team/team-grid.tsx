"use client";

import Link from "next/link";
import { useState } from "react";
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

export default function TeamGrid({ members }: { members: TeamMember[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {members.map((member) => {
        const isExpanded = expandedId === member._id;
        const isOpen = member.status === "open";
        const roleLabel = member.displayRole || member.role || "Team";

        if (isOpen) {
          return (
            <div key={member._id} className="border-y border-border py-5">
              <div className="flex flex-col items-center text-center">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">{roleLabel}</p>
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

        return (
          <button
            key={member._id}
            onClick={() => setExpandedId(isExpanded ? null : member._id)}
            className="group border-y border-border py-5 text-left transition-colors hover:border-ink/40"
          >
            <div className="flex flex-col items-center text-center">
              {member.photo ? (
                <div
                  className="mb-4 h-20 w-20 rounded-full bg-cover bg-center grayscale-[5%] saturate-[0.9] ring-1 ring-border transition-transform group-hover:scale-[1.02]"
                  style={{
                    backgroundImage: `url('${urlFor(member.photo).width(160).height(160).fit("crop").url()}')`,
                  }}
                />
              ) : (
                <div className="mb-4 h-20 w-20 rounded-full bg-background ring-1 ring-border" />
              )}
              <p className="text-xs uppercase tracking-[0.22em] text-muted">{roleLabel}</p>
              <h3 className="mt-2 text-xl font-serif tracking-tight text-ink">{member.name}</h3>

              {isExpanded && (
                <div className="mt-3 flex flex-col items-center">
                  {member.bio && (
                    <p className="mx-auto max-w-xs text-xs leading-relaxed text-muted">{member.bio}</p>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 inline-flex items-center gap-1.5 border-b border-border pb-1 text-xs text-muted hover:border-ink hover:text-ink"
                    >
                      <LinkedInIcon />
                      LinkedIn
                    </a>
                  )}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
