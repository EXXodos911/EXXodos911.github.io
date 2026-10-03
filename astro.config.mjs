import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { codeBlockFrame } from "./src/utils/code-block.mjs";
import { slashAliases } from "./src/utils/slash-aliases.mjs";

export default defineConfig({
  output: "static",
  site: "https://exxodos911.github.io",
  // Pages are written as path.html (canonical URLs have no trailing slash) and
  // copied to path/index.html, so /path and /path/ both load without a redirect.
  build: {
    format: "file",
  },
  integrations: [sitemap(), slashAliases()],
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
