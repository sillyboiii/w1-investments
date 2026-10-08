import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "w1-investments",
  title: "W1 Investments",
  projectId,
  dataset,
  basePath: "/studio",
  apiVersion,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
