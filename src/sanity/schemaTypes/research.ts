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
    defineField({
      name: "model",
      title: "Financial model (spreadsheet)",
      description: "The valuation/DCF model that backs this thesis. Shown as a download.",
      type: "file",
      options: { accept: ".xlsx,.xls,.csv,.pdf" },
    }),
    defineField({
      name: "body",
      title: "Body",
      description: "The full research note. Use headings to structure it.",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [{ name: "href", type: "url", title: "URL" }],
              },
            ],
          },
        },
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
