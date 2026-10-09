import { defineField, defineType } from "sanity";

export const teamMemberType = defineType({
  name: "teamMember",
  title: "Team Member",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "displayRole",
      title: "Display Role (shown on site)",
      type: "string",
      description: "e.g. Founder & President, Head of Macro",
    }),
    defineField({
      name: "role",
      title: "Role Category",
      type: "string",
      options: {
        list: [
          { title: "Founder / President", value: "founder-president" },
          { title: "Vice President", value: "vice-president" },
          { title: "CIO / Head of Investments", value: "cio-head-investments" },
          { title: "Head of Fundamental Research", value: "head-fundamental" },
          { title: "Fundamental Research Analyst", value: "fundamental-analyst" },
          { title: "Head of Macro", value: "head-macro" },
          { title: "Macro Analyst", value: "macro-analyst" },
          { title: "Head of Quant", value: "head-quant" },
          { title: "Quantitative Research / Portfolio Risk", value: "quant-analyst" },
          { title: "Head of Digital Assets", value: "head-digital-assets" },
          { title: "Digital Asset Analyst", value: "digital-assets-analyst" },
          { title: "Head of Operations / Platform", value: "head-ops" },
          { title: "Operations", value: "operations" },
          { title: "Brand & Creative", value: "brand-creative" },
          { title: "Media / Social", value: "media-social" },
          { title: "Research Publishing", value: "research-publishing" },
          { title: "Partnerships & Events", value: "partnerships-events" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "group",
      title: "Group (for layout)",
      type: "string",
      options: {
        list: [
          { title: "Leadership", value: "leadership" },
          { title: "Research", value: "research" },
          { title: "Platform/Operations", value: "platform" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subGroup",
      title: "Sub-group",
      type: "string",
      options: {
        list: [
          { title: "Fundamental", value: "fundamental" },
          { title: "Macro", value: "macro" },
          { title: "Quant", value: "quant" },
          { title: "Digital Assets", value: "digital-assets" },
          { title: "Platform", value: "platform" },
          { title: "Leadership", value: "leadership" },
        ],
      },
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Filled", value: "filled" },
          { title: "Open", value: "open" },
        ],
      },
      initialValue: "filled",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "linkedin",
      title: "LinkedIn URL",
      type: "url",
    }),
    defineField({
      name: "photo",
      title: "Profile photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "bio",
      title: "Short bio / description",
      type: "text",
      rows: 4,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "displayRole",
      media: "photo",
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || "Open position",
        subtitle: subtitle || "",
        media,
      };
    },
  },
});
