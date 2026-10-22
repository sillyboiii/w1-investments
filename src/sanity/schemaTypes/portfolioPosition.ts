import { defineField, defineType } from "sanity";

export const portfolioPositionType = defineType({
  name: "portfolioPosition",
  title: "Portfolio Position",
  type: "document",
  fields: [
    defineField({ name: "ticker", title: "Ticker (e.g. AAPL)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "name", title: "Company Name", type: "string" }),
    defineField({ name: "shares", title: "Shares", type: "number", validation: (r) => r.required().min(0) }),
    defineField({ name: "costBasis", title: "Average Cost Basis (per share)", type: "number" }),
    defineField({ name: "purchaseDate", title: "Purchase Date", type: "date" }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Closed", value: "closed" },
        ],
        layout: "radio",
      },
      initialValue: "active",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "closePrice",
      title: "Exit Price (per share)",
      description:
        "The price the position was sold at. Required to close a position — the realised P/L is added back into the portfolio's cash.",
      type: "number",
      hidden: ({ document }) => document?.status !== "closed",
      validation: (r) =>
        r.custom((value, context) =>
          context.document?.status === "closed" && typeof value !== "number"
            ? "Set an exit price to close this position."
            : true,
        ),
    }),
    defineField({
      name: "closedAt",
      title: "Closed On",
      description: "Date the position was sold.",
      type: "date",
      hidden: ({ document }) => document?.status !== "closed",
      validation: (r) =>
        r.custom((value, context) =>
          context.document?.status === "closed" && !value
            ? "Set the date the position was closed."
            : true,
        ),
    }),
    defineField({ name: "notes", title: "Notes", type: "text", rows: 2 }),
    defineField({
      name: "research",
      title: "Research / thesis",
      description: "Link the research note that justifies this position.",
      type: "reference",
      to: [{ type: "research" }],
    }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 0 }),
  ],
  preview: {
    select: { title: "ticker", subtitle: "shares" },
  },
});
