# EXXodos911 — Notes

Source for [exxodos911.github.io](https://exxodos911.github.io), a minimal static blog built with Astro. Just commit Markdown, GitHub Actions builds static HTML, Pages serves it. No runtime Markdown conversion or client-side framework; article TOCs use a small progressive-enhancement script.

It includes:

- Markdown posts in `src/content/blog/` via Content Collections
- Responsive about-me sidebar
- Clean list of posts + individual static post pages
- Tag pages, plus a table of contents on posts with two or more headings: a sticky rail that tracks your position on wide screens, and a collapsible box on narrow ones
- Code blocks with a language label and copy button
- Self-hosted Inter and JetBrains Mono (no third-party font requests)
- SEO: canonical, Open Graph, Twitter cards, JSON-LD, sitemap, full-content RSS, `robots.txt`, `404`
- Every page loads directly at both `/path` and `/path/`, with no redirect
- Accessible skip link, focus states, and reduced-motion support

## Write a post

Create `src/content/blog/my-post.md`:

```md
---
title: 'My title'
description: 'One-line summary.'
pubDate: 2026-09-21
tags: ['notes']
draft: false
---

Your Markdown here. Headings, lists, quotes, code, and images all work.
```

Then:

```bash
git add src/content/blog/my-post.md
git commit -m "Add my post"
git push origin main
```

Actions validates and builds the site (`npm run validate`), then deploys to GitHub Pages. If validation fails, nothing is deployed. Your post is live at `/blog/my-post` (`/blog/my-post/` works too).

- `draft: true` hides a post from the production build (lists, RSS, sitemap). Drafts still show in `npm run dev` with a **Draft** badge, so you can preview them locally.
- Filename becomes the URL slug. Use lowercase with dashes.
- `pubDate` sorts newest first and feeds RSS/sitemap.

### Images

Put images for a post in a folder beside its Markdown file, for example
`src/content/blog/my-post/diagram.jpg`, then reference them with a relative path:

```md
![A diagram showing the process](./my-post/diagram.jpg)
```

Astro processes local images at build time: Markdown images become WebP with a responsive
`srcset`, never wider than the original. Add an optional cover image in frontmatter to get an
AVIF/WebP hero image (falling back to the original format). The cover is also cropped to a
1200×630 JPEG and used as the post's social preview image:

```yaml
cover: ./my-post/cover.jpg
coverAlt: A view of the finished project
```

Markdown images should include meaningful alt text. Keep decorative image alt text
empty (`![](./my-post/decoration.png)`). Images placed in `public/` are copied as-is
and do not use Astro's optimization pipeline.

## Run locally

This project uses Astro 7 and Node.js 22.12+, 24, or 26 (the `engines` field in
`package.json`; CI uses a version from that range).

```bash
npm install
npm run dev
```

Then open the local URL shown in your terminal.

Run the same checks used by CI with `npm run validate`. It type-checks, builds, and then runs `scripts/verify-build.mjs` against `dist/`, which fails on:

- pages missing a title, description, or exactly one `<h1>`
- internal links that are broken or would only resolve through a redirect
- pages that don't load directly at both `/path` and `/path/`
- canonical, RSS, or sitemap URLs that don't match a built page
- a missing or non-PNG/JPEG social image
- any `draft: true` post appearing in the output

## Build

```bash
npm run build
npm run preview
```

## URLs

Pages are built as `path.html`, and a small integration (`src/utils/slash-aliases.mjs`)
copies each one to `path/index.html`. GitHub Pages then serves `/path` and `/path/`
directly, without redirecting either form. Canonical URLs, RSS, and the sitemap use the
form without a trailing slash, so search engines see one URL per page.

## Customize

- Edit name, bio, and links in `src/site.ts`.
- Set the public site URL in `astro.config.mjs` (`site`). Canonical URLs, RSS, the sitemap, and `robots.txt` are all derived from it.
- The social preview image is `public/og-card.png` (1200×630). Its source is `assets/og-card.svg`. After editing it, regenerate the PNG with the site's Inter font (needs `rsvg-convert` and `woff2_decompress`):

  ```bash
  npm run og-card
  ```
- Adjust the theme in `src/styles/global.css`.
