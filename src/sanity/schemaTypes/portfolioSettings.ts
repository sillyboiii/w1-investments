import { defineField, defineType } from "sanity";

export const portfolioSettingsType = defineType({
  name: "portfolioSettings",
  title: "Portfolio Settings",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", initialValue: "W1 Simulated Portfolio" }),
    defineField({ name: "cash", title: "Cash Balance ($)", type: "number", initialValue: 100000 }),
    defineField({ name: "startingBalance", title: "Starting Balance ($)", type: "number", initialValue: 100000 }),
    defineField({ name: "updatedAt", title: "Last Updated", type: "datetime", initialValue: () => new Date().toISOString() }),
    defineField({ name: "notes", title: "Notes", type: "text", rows: 3 }),
  ],
  preview: { select: { title: "name" } },
});
