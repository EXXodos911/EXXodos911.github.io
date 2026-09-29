import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { codeBlockFrame } from "./src/utils/code-block.mjs";

export default defineConfig({
  output: "static",
  site: "https://exxodos911.github.io",
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: "github-dark-dimmed",
      transformers: [codeBlockFrame()],
    },
  },
});
