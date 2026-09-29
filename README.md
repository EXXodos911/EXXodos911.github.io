# Minimal Black Astro Blog

A minimal static blog built with Astro. Just commit Markdown, GitHub Actions builds static HTML, Pages serves it. No runtime Markdown conversion or client-side framework; article TOCs use a small progressive-enhancement script.

It includes:

- Markdown posts in `src/content/blog/` via Content Collections
- Responsive about-me sidebar
- Clean list of posts + individual static post pages
- Tag pages, plus a table of contents on posts with two or more headings: a sticky rail that tracks your position on wide screens, and a collapsible box on narrow ones
- Code blocks with a language label and copy button
- Self-hosted Inter and JetBrains Mono (no third-party font requests)
- SEO: canonical, Open Graph, Twitter cards, JSON-LD, sitemap, RSS, `robots.txt`, `404`
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

Actions validates and builds the site (`npm run validate`), then deploys to GitHub Pages. If validation fails, nothing is deployed. Your post is live at `/blog/my-post`.

- `draft: true` hides a post from the production build (lists, RSS, sitemap). Drafts still show in `npm run dev` with a **Draft** badge, so you can preview them locally.
- Filename becomes the URL slug. Use lowercase with dashes.
- `pubDate` sorts newest first and feeds RSS/sitemap.

## Run locally

This project uses Astro 7 and requires Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Run the same checks used by CI with `npm run validate`. It type-checks, builds, and then runs `scripts/verify-build.mjs` against `dist/`, which fails on:

- pages missing a title, description, or exactly one `<h1>`
- broken internal links
- canonical, RSS, or sitemap URLs that don't match a built page
- a missing or non-PNG/JPEG social image
- any `draft: true` post appearing in the output

Then open the local URL shown in your terminal.

## Build

```bash
npm run build
npm run preview
```

## Customize

- Edit name, bio, and links in `src/site.ts`.
- Set the public site URL in `astro.config.mjs` (`site`). Canonical URLs, RSS, the sitemap, and `robots.txt` are all derived from it.
- The social preview image is `public/og-card.png` (1200×630). Its source is `assets/og-card.svg`. After editing it, regenerate the PNG:

  ```bash
  rsvg-convert -w 1200 -h 630 assets/og-card.svg -o public/og-card.png
  ```
- Adjust the theme in `src/styles/global.css`.
