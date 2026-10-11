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

export const RESEARCH_SECTIONS: { key: string; label: string }[] = [
  { key: "fundamental", label: "Fundamental Research" },
  { key: "macro", label: "Macro Research" },
  { key: "quant", label: "Quantitative Research + Portfolio Risk" },
  { key: "digital-assets", label: "Digital Assets" },
];
