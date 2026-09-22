# Minimal Black Astro Blog

A minimal static blog built with Astro. Just commit Markdown, GitHub Actions builds static HTML, Pages serves it. No runtime Markdown conversion or client-side framework; article TOCs use a small progressive-enhancement script.

It includes:

- Markdown posts in `src/content/blog/` via Content Collections
- Responsive about-me sidebar
- Clean list of posts + individual static post pages
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

Actions builds (`npm run build`) and deploys to GitHub Pages. Your post is live at `/blog/my-post`.

- `draft: true` hides a post from lists, RSS, and sitemap.
- Filename becomes the URL slug. Use lowercase with dashes.
- `pubDate` sorts newest first and feeds RSS/sitemap.

## Run locally

This project uses Astro 7 and requires Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Run the same checks used by CI with `npm run validate`.

Then open the local URL shown in your terminal.

## Build

```bash
npm run build
npm run preview
```

## Customize

- Edit name, bio, links, and site URL in `src/site.ts`.
- Replace `public/og-card.svg` if you want a custom social preview image.
- Adjust the theme in `src/styles/global.css`.
