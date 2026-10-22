import { defineField, defineType } from "sanity";

export const portfolioSettingsType = defineType({
  name: "portfolioSettings",
  title: "Portfolio Settings",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", initialValue: "W1 Simulated Portfolio" }),
    defineField({
      name: "startingBalance",
      title: "Total Capital ($)",
      description:
        "The money the fund started with. Portfolio value is always Total Capital + unrealised P/L + realised P/L. Cash is derived automatically: Total Capital − capital deployed into open positions + realised proceeds.",
      type: "number",
      initialValue: 100000,
      validation: (rule) => rule.required().min(0),
    }),
    defineField({ name: "updatedAt", title: "Last Updated", type: "datetime", initialValue: () => new Date().toISOString() }),
    defineField({ name: "notes", title: "Notes", type: "text", rows: 3 }),
  ],
  preview: { select: { title: "name" } },
});
