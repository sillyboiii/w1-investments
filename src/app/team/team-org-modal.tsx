"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { urlFor } from "@/sanity/lib/image";
import {
  LEADERSHIP_SLOTS,
  PLATFORM_SLOTS,
  RESEARCH_GROUPS,
  memberGroup,
  memberSubGroup,
  normalizeRole,
  type OrgSlot,
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
  return <div className="mx-auto h-9 w-px bg-border" />;
}

interface OrgNodeData {
  key: string;
  title: string;
  member: TeamMember | null;
}

function FilledNode({ member, onClick }: { member: TeamMember; onClick: () => void }) {
  const roleLabel = member.displayRole || member.role || member.group;
  return (
    <button
      onClick={onClick}
      className="group mx-auto flex w-full max-w-sm flex-col items-center border border-border bg-background px-4 py-5 text-center transition-colors hover:border-ink"
    >
      {member.photo ? (
        <span
          className="mb-3 block h-16 w-16 rounded-full bg-cover bg-center grayscale-[5%] saturate-[0.9] ring-1 ring-border"
          style={{
            backgroundImage: `url('${urlFor(member.photo as Parameters<typeof urlFor>[0]).width(128).height(128).fit("crop").url()}')`,
          }}
        />
      ) : (
        <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-border text-sm uppercase tracking-widest text-muted">
          {member.name?.slice(0, 2).toUpperCase()}
        </span>
      )}
      <span className="text-[11px] uppercase tracking-[0.22em] text-muted">{roleLabel}</span>
      <h3 className="mt-2 text-lg font-serif tracking-tight text-ink">{member.name}</h3>
      <span className="mt-1 text-[11px] uppercase tracking-widest text-muted opacity-0 transition-opacity group-hover:opacity-100">
        View profile
      </span>
    </button>
  );
}

function OpenNode({ title }: { title: string }) {
  return (
    <Link
      href="/join"
      className="group mx-auto flex w-full flex-col items-center border border-dashed border-border px-4 py-5 text-center transition-colors hover:border-ink"
    >
      <span className="text-[10px] uppercase tracking-[0.22em] text-muted">Open position</span>
      <span className="mt-2 text-base font-serif tracking-tight text-ink">{title}</span>
      <span className="mt-1 text-[10px] uppercase tracking-widest text-muted opacity-0 transition-opacity group-hover:opacity-100">
        Apply
      </span>
    </Link>
  );
}

function SlotNode({ node, onClick }: { node: OrgNodeData; onClick: (m: TeamMember) => void }) {
  if (node.member && node.member.status !== "open") {
    return <FilledNode member={node.member} onClick={() => onClick(node.member as TeamMember)} />;
  }
  const title = node.member?.displayRole || node.member?.role || node.title;
  return <OpenNode title={title} />;
}

function buildOrg(members: TeamMember[]) {
  const roleMap = new Map<string, TeamMember>();
  for (const m of members) {
    const r = normalizeRole(m.role);
    if (r && !roleMap.has(r)) roleMap.set(r, m);
  }

  const matched = new Set<string>();
  const slot = (s: OrgSlot): OrgNodeData => {
    const m = roleMap.get(s.role) ?? null;
    if (m) matched.add(m._id);
    return { key: s.role, title: s.title, member: m };
  };

  const leadership = LEADERSHIP_SLOTS.map(slot);
  const founder = leadership[0];
  const leadershipRest = leadership.slice(1);

  const researchColumns = RESEARCH_GROUPS.map((g) => ({
    key: g.key,
    label: g.label,
    nodes: g.slots.map(slot),
  }));

  const platformColumn = {
    key: "platform",
    label: "Platform / Operations",
    nodes: PLATFORM_SLOTS.map(slot),
  };

  const extras = members.filter((m) => !matched.has(m._id));
  const extraLeadership: OrgNodeData[] = [];
  const extraOther: OrgNodeData[] = [];
  for (const m of extras) {
    const node: OrgNodeData = { key: m._id, title: m.displayRole || m.role || "Team", member: m };
    const group = memberGroup(m);
    if (group === "leadership") {
      extraLeadership.push(node);
    } else if (group === "research") {
      const col = researchColumns.find((c) => c.key === memberSubGroup(m));
      (col ? col.nodes : extraOther).push(node);
    } else if (group === "platform") {
      platformColumn.nodes.push(node);
    } else {
      extraOther.push(node);
    }
  }

  const columns = [
    ...researchColumns,
    platformColumn,
    ...(extraOther.length > 0 ? [{ key: "other", label: "Team", nodes: extraOther }] : []),
  ];

  return { founder, leadershipRest, extraLeadership, columns };
}

function MobileGroup({
  label,
  nodes,
  onSelect,
}: {
  label: string;
  nodes: OrgNodeData[];
  onSelect: (m: TeamMember) => void;
}) {
  return (
    <div className="px-5 py-6 md:px-8">
      <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      <div className="space-y-3">
        {nodes.map((n) => (
          <SlotNode key={n.key} node={n} onClick={onSelect} />
        ))}
      </div>
    </div>
  );
}

export default function TeamOrgModal({ members }: { members: TeamMember[] }) {
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const org = useMemo(() => buildOrg(members), [members]);
  const { founder, leadershipRest, extraLeadership, columns } = org;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[92rem] px-5 md:px-8 lg:px-10"
      >
        <div className="hidden lg:block border-y border-border py-10">
          <div className="mx-auto max-w-4xl">
            <SlotNode node={founder} onClick={setSelected} />

            <Connector />
            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: `repeat(${leadershipRest.length}, minmax(0, 1fr))` }}
            >
              {leadershipRest.map((n) => (
                <SlotNode key={n.key} node={n} onClick={setSelected} />
              ))}
            </div>

            {extraLeadership.length > 0 && (
              <>
                <Connector />
                <div
                  className="grid gap-6"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(extraLeadership.length, 3)}, minmax(0, 1fr))`,
                  }}
                >
                  {extraLeadership.map((n) => (
                    <SlotNode key={n.key} node={n} onClick={setSelected} />
                  ))}
                </div>
              </>
            )}
          </div>

          <Connector />
          <div className="mx-auto h-px max-w-6xl bg-border" />

          <div
            className="grid gap-6 pt-8"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {columns.map((col, i) => (
              <motion.div
                key={col.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
                className="border-t border-border pt-5"
              >
                <p className="min-h-8 text-xs uppercase tracking-[0.2em] text-muted">{col.label}</p>
                <div className="mt-3 space-y-2">
                  {col.nodes.map((n) => (
                    <SlotNode key={n.key} node={n} onClick={setSelected} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:hidden divide-y divide-border border-y border-border">
          <MobileGroup
            label="Leadership"
            nodes={[founder, ...leadershipRest, ...extraLeadership]}
            onSelect={setSelected}
          />
          {columns.map((col) => (
            <MobileGroup key={col.key} label={col.label} nodes={col.nodes} onSelect={setSelected} />
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-[2px]"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label={`${selected.name} profile`}
              className="relative w-full max-w-lg overflow-hidden border border-border bg-background shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1 w-full bg-ink" />
              <button
                onClick={() => setSelected(null)}
                aria-label="Close profile"
                className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>

              <div className="px-8 pb-9 pt-11 text-center md:px-14 md:pb-11">
                {selected.photo ? (
                  <div
                    className="mx-auto mb-6 h-28 w-28 rounded-full bg-cover bg-center ring-1 ring-border grayscale-[8%] saturate-[0.95]"
                    style={{ backgroundImage: `url('${urlFor(selected.photo as Parameters<typeof urlFor>[0]).width(224).height(224).fit("crop").url()}')` }}
                  />
                ) : (
                  <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full border border-border font-serif text-2xl tracking-tight text-muted">
                    {selected.name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                )}

                <p className="text-[11px] uppercase tracking-[0.28em] text-muted">
                  {selected.displayRole || selected.role}
                </p>
                <h3 className="mt-3 font-serif text-3xl tracking-tight text-ink md:text-4xl">
                  {selected.name}
                </h3>

                {selected.bio && (
                  <>
                    <div className="mx-auto my-6 h-px w-12 bg-border" />
                    <p className="mx-auto max-w-md text-sm leading-relaxed text-muted">
                      {selected.bio}
                    </p>
                  </>
                )}

                {selected.linkedin && (
                  <a
                    href={selected.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center gap-2 border border-ink px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-background"
                  >
                    <LinkedInIcon /> Connect on LinkedIn
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
