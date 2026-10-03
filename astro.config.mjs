import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { codeBlockFrame } from "./src/utils/code-block.mjs";

export default defineConfig({
  output: "static",
  site: "https://exxodos911.github.io",
  integrations: [sitemap()],
  // Local images (Markdown and astro:assets) get responsive srcset/sizes,
  // capped at their natural width.
  image: {
    layout: "constrained",
    responsiveStyles: true,
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark-dimmed",
      transformers: [codeBlockFrame()],
    },
  },
});
