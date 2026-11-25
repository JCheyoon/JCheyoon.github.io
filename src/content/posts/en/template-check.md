---
title: "Template check sample post"
slug: template-check
description: "A sample for checking the English post template (title, body styles, image, table, code, sources, previous and next posts). It is never deployed."
category: etc
tags: [sample]
status: draft
lang: en
translated_from: ko
ai_assisted: true
audience: "The site owner checking the blog template"
search_intent: "Not applicable (a check-only post that is never deployed)"
created_at: 2026-11-25
reviewed_at:
reviewed_by:
review_notes:
published_at:
updated_at:
disclosure:
sources:
  - title: "Astro Docs"
    url: "https://docs.astro.build/"
    accessed: 2026-11-25
---

This is the English translation of the template check sample. It stays `status: draft`, so it never reaches the deployed build. It only shows up on the dev server (`npm run dev`) and in the template check build (`INCLUDE_DRAFTS=true`). scripts/check-content.ts makes sure this file stays a draft and that its Korean original exists.

## Headings and paragraphs

Body text is styled with Tailwind typography (`prose`). This paragraph checks how longer English sentences wrap inside the post column.

### Lists

- First item of an unordered list
- Second item
  - Nested item

1. Ordered list
2. Second step

## Quotes and links

> A paragraph for checking the blockquote style.

External link example: [Astro Docs](https://docs.astro.build/)

## Code

```ts
export function postUrl(slug: string): string {
  return `/en/post/${slug}/`;
}
```

## Table

| Item | Value |
|---|---|
| URL format | `/en/post/slug/` |
| Published when | `status: published` |

## Image

![Site icon: the Korean characters '채윤' on a white background, with the first stroke of '채' in teal](../../../assets/posts/template-check/sample-icon.png)
