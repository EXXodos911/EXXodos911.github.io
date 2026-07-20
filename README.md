# Minimal Black Astro Blog

A minimal static blog built with Astro. It includes:

- A responsive about-me sidebar
- A clean list of posts
- Individual static post pages
- No client-side JavaScript
- Accessible focus states and reduced-motion support

## Run locally

This project uses Astro 7 and requires Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Then open the local URL shown in your terminal.

## Build

```bash
npm run build
npm run preview
```

## Customize

- Edit the name, bio, and links in `src/components/Sidebar.astro`.
- Add or change posts in `src/data/posts.ts`.
- Adjust the theme in `src/styles/global.css`.
