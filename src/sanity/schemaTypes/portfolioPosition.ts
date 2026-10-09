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
    defineField({ name: "status", title: "Status", type: "string", options: { list: [{title:"Active", value:"active"}, {title:"Closed", value:"closed"}]}, initialValue: "active" }),
    defineField({ name: "notes", title: "Notes", type: "text", rows: 2 }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 0 }),
  ],
  preview: {
    select: { title: "ticker", subtitle: "shares" },
  },
});
