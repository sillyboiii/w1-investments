import { defineField, defineType } from "sanity";

export const researchType = defineType({
  name: "research",
  title: "Research",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          "Equity Research",
          "Macro",
          "Quantitative",
          "Digital Assets",
          "Market Briefs",
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "analyst", title: "Analyst", type: "string" }),
    defineField({ name: "ticker", title: "Company / Ticker", type: "string" }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "abstract",
      title: "Short abstract",
      type: "text",
      rows: 4,
      validation: (rule) => rule.max(450),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image / graphic",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "report",
      title: "PDF / report download",
      type: "file",
      options: { accept: ".pdf" },
    }),
    defineField({ name: "executiveSummary", title: "Executive summary", type: "text", rows: 5 }),
    defineField({ name: "thesis", title: "Thesis", type: "text", rows: 5 }),
    defineField({ name: "catalysts", title: "Catalysts", type: "text", rows: 4 }),
    defineField({ name: "risks", title: "Risks", type: "text", rows: 4 }),
    defineField({ name: "valuation", title: "Valuation discussion", type: "text", rows: 5 }),
    defineField({ name: "sources", title: "Sources / references", type: "text", rows: 5 }),
    defineField({
      name: "body",
      title: "Long-form article body",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "coverImage",
    },
  },
});
