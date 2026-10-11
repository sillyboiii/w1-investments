export interface TeamMember {
  _id: string;
  name?: string;
  displayRole?: string;
  role?: string;
  group?: string;
  subGroup?: string;
  status?: "filled" | "open";
  order?: number;
  linkedin?: string;
  photo?: unknown;
  bio?: string;
}

const ROLE_SYNONYMS: Record<string, string> = {
  founder: "founder-president",
  president: "founder-president",
  "co-founder": "founder-president",
  "co-founder-president": "founder-president",
  "founder-and-president": "founder-president",
  "founder-and-ceo": "founder-president",
  "vice-president": "vice-president",
  vp: "vice-president",
  "vice-president-investments": "vice-president",
  cio: "cio-head-investments",
  "head-of-investments": "cio-head-investments",
  "cio-head-of-investments": "cio-head-investments",
};

export function normalizeRole(raw?: string): string {
  if (!raw) return "";
  const slug = raw
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ROLE_SYNONYMS[slug] ?? slug;
}

const ROLE_META: Record<string, { group: string; subGroup?: string }> = {
  "founder-president": { group: "leadership" },
  "vice-president": { group: "leadership" },
  "cio-head-investments": { group: "leadership" },
  "head-fundamental": { group: "research", subGroup: "fundamental" },
  "fundamental-analyst": { group: "research", subGroup: "fundamental" },
  "head-macro": { group: "research", subGroup: "macro" },
  "macro-analyst": { group: "research", subGroup: "macro" },
  "head-quant": { group: "research", subGroup: "quant" },
  "quant-analyst": { group: "research", subGroup: "quant" },
  "head-digital-assets": { group: "research", subGroup: "digital-assets" },
  "digital-assets-analyst": { group: "research", subGroup: "digital-assets" },
  "head-ops": { group: "platform", subGroup: "platform" },
  operations: { group: "platform", subGroup: "platform" },
  "brand-creative": { group: "platform", subGroup: "platform" },
  "media-social": { group: "platform", subGroup: "platform" },
  "research-publishing": { group: "platform", subGroup: "platform" },
  "partnerships-events": { group: "platform", subGroup: "platform" },
};

export function memberGroup(m: TeamMember): string {
  if (m.group) return m.group;
  return ROLE_GROUP_FALLBACK(m.role)?.group ?? "";
}

export function memberSubGroup(m: TeamMember): string {
  if (m.subGroup) return m.subGroup;
  return ROLE_GROUP_FALLBACK(m.role)?.subGroup ?? "";
}

function ROLE_GROUP_FALLBACK(role?: string): { group: string; subGroup?: string } | undefined {
  return ROLE_META[normalizeRole(role)];
}

export interface OrgSlot {
  role: string;
  title: string;
}

export const LEADERSHIP_SLOTS: OrgSlot[] = [
  { role: "founder-president", title: "Founder / President" },
  { role: "vice-president", title: "Vice President" },
  { role: "cio-head-investments", title: "CIO / Head of Investments" },
];

export const RESEARCH_GROUPS: { key: string; label: string; slots: OrgSlot[] }[] = [
  {
    key: "fundamental",
    label: "Fundamental Research",
    slots: [
      { role: "head-fundamental", title: "Head of Fundamental Research" },
      { role: "fundamental-analyst", title: "Fundamental Research Analyst" },
    ],
  },
  {
    key: "macro",
    label: "Macro Research",
    slots: [
      { role: "head-macro", title: "Head of Macro" },
      { role: "macro-analyst", title: "Macro Analyst" },
    ],
  },
  {
    key: "quant",
    label: "Quantitative Research",
    slots: [
      { role: "head-quant", title: "Head of Quant" },
      { role: "quant-analyst", title: "Portfolio Risk / Quant Analyst" },
    ],
  },
  {
    key: "digital-assets",
    label: "Digital Assets",
    slots: [
      { role: "head-digital-assets", title: "Head of Digital Assets" },
      { role: "digital-assets-analyst", title: "Digital Asset Analyst" },
    ],
  },
];

export const PLATFORM_SLOTS: OrgSlot[] = [
  { role: "head-ops", title: "Head of Operations / Platform" },
  { role: "operations", title: "Operations" },
  { role: "brand-creative", title: "Brand & Creative" },
  { role: "media-social", title: "Media / Social" },
  { role: "research-publishing", title: "Research Publishing" },
  { role: "partnerships-events", title: "Partnerships & Events" },
];
