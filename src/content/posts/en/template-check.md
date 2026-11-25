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

This is the English translation of the template check sample. It stays `status: draft`, so it never reaches the deployed build. It only shows up on the dev server (`npm run dev`) and in the template check build (`INCLUDE_DRAFTS=true`). scripts/check-content.ts makes sure this file stays a draft and that its Korean original exists. It contains every body element (SPEC §6.1).

## Headings and paragraphs

Body text uses Tailwind typography (`prose`) with our own styles on top. Text with colons must stay intact: 10:30, localhost:4321, 16:9.

### Third-level heading

Hover over a heading to see a `#` link at its end.

#### Fourth-level heading

Fourth-level headings get the link too.

## Lists

- First item of an unordered list
- Second item
  - Nested item

1. Ordered list
2. Second step

## Quotes and links

> A paragraph for checking the blockquote style. It has no italics or quote marks, just a bar on the left.

External link example: [Astro Docs](https://docs.astro.build/). Links have a dashed underline and get a background on hover.

## Callouts

> [!NOTE]
> Without a title, the callout uses its type name (Note).

> [!TIP] Speeding up builds
> Text on the same line becomes the title. The body can have **bold**, `code`, and [links to the Astro Docs](https://docs.astro.build/).

> [!IMPORTANT]
> Something important.

> [!WARNING] A command you cannot undo
> Something to be careful about.

> [!CAUTION]
> Something dangerous.

## Code

```ts title="src/lib/posts.ts" {2}
export function postUrl(slug: string): string {
  return `/en/post/${slug}/`;
}
```

```js ins={2} del={3}
const site = {
  url: "https://jcheyoon.github.io",
  url: "http://localhost:4321",
};
```

```ts collapse={1-3}
// collapsed line 1
// collapsed line 2
// collapsed line 3
export const visible = true;
```

```shellsession
$ npm run verify
check-content: 3 posts, 0 errors, 0 warnings
```

## Table

| Item | Value |
|---|---|
| URL format | `/en/post/slug/` |
| Published when | `status: published` |

---

## Image

![Site icon: the Korean characters '채윤' on a white background, with the first stroke of '채' in teal](../../../assets/posts/template-check/sample-icon.png)
