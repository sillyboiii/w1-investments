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
      name: "role",
      title: "Role / Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "group",
      title: "Group",
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
      title: "Sub-group (e.g. Fundamental, Macro, Quant, Digital Assets)",
      type: "string",
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
      title: "Short bio",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "photo",
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || "Open position",
        subtitle,
        media,
      };
    },
  },
});
