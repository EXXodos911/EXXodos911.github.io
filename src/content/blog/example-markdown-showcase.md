---
title: 'Markdown showcase'
description: 'A quick tour of headings, lists, quotes, code, and images in this theme.'
pubDate: 2026-09-20
tags: ['meta', 'markdown']
draft: true
---

This example shows everything the article style supports.

## Headings look like this

### Even smaller headings work too

Regular paragraphs use a serif face for comfortable reading. Links look like [this link to nowhere](#), with an underline that brightens on hover.

## Lists

- Small sites load fast
- Small sites age gracefully
- Small sites leave room for personality

1. Write a markdown file
2. Commit and push
3. Actions builds static HTML

## Quotes

> Protecting attention is not about becoming unreachable. It is about making deliberate space for work that requires depth.

## Code

Inline code looks like `npm run build`. Bigger blocks get a card:

```bash
npm install
npm run dev
npm run build
```

```js
export function hello(name) {
  return `hello, ${name}`;
}
```

Long lines scroll sideways instead of wrapping, and every block has a copy button:

```python
def summarize(posts, *, limit=5, include_drafts=False, sort_key=lambda post: post.published_at, reverse=True):
    visible = [post for post in posts if include_drafts or not post.draft]
    return sorted(visible, key=sort_key, reverse=reverse)[:limit]
```

### Plain text and diffs

```diff
- const posts = await getCollection('blog');
+ const posts = await getVisiblePosts();
```

## Tables

| Feature        | Where it lives              | Needs JavaScript |
| -------------- | --------------------------- | ---------------- |
| Table of contents | Sidebar or collapsible box | No (tracking is optional) |
| Copy button    | Code block header           | Yes              |
| Drafts         | `npm run dev` only          | No               |

## Emphasis

Use **bold** for the one phrase a skimming reader must not miss, and *italics* for a softer stress. Keep both rare.

---

That is it. If it renders well here, your real posts will too.
