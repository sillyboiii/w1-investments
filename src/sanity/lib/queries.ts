import { groq } from "next-sanity";

export const researchListQuery = groq`
  *[_type == "research" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    category,
    analyst,
    publishedAt,
    abstract,
    ticker,
    coverImage,
    "reportUrl": report.asset->url
  }
`;

export const researchBySlugQuery = groq`
  *[_type == "research" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    category,
    analyst,
    publishedAt,
    abstract,
    ticker,
    executiveSummary,
    thesis,
    catalysts,
    risks,
    valuation,
    sources,
    body,
    "reportUrl": report.asset->url
  }
`;

export const teamMembersQuery = groq`
  *[_type == "teamMember"] | order(order asc, name asc) {
    _id,
    name,
    role,
    displayRole,
    group,
    subGroup,
    status,
    order,
    linkedin,
    photo,
    bio
  }
`;

export const portfolioPositionsQuery = groq`
  *[_type == "portfolioPosition" && status == "active"] | order(order asc, ticker asc) {
    _id,
    ticker,
    name,
    shares,
    costBasis,
    purchaseDate,
    notes
  }
`;

export const portfolioSettingsQuery = groq`
  *[_type == "portfolioSettings"][0] {
    _id,
    name,
    cash,
    startingBalance,
    updatedAt,
    notes
  }
`;
