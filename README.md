# CHEYOON

English · [한국어](README.ko.md)

A blog about problems I ran into while building software, and how I solved them.

**Blog:** https://jcheyoon.github.io/en/ · [한국어](https://jcheyoon.github.io)

I draft, check, and translate posts with the **MCP server** in this repository and Claude Code. A post is published only after I review it.

## Tech stack

| Area | Tools |
|---|---|
| Site | Astro 7 (static site generation), TypeScript, Tailwind CSS 4 |
| Content | Markdown + git |
| Search | Pagefind (the index is built at build time) |
| Preview images | Satori + resvg create a 1200×630 PNG for each post |
| Writing tools | MCP TypeScript SDK (stdio server) |
| Deployment | GitHub Actions → GitHub Pages |

## Features

- **Korean and English:** Korean lives at `/`, English at `/en/`. Originals and translations are linked with `hreflang`, and translations show a note that they were translated with AI assistance.
- **Reading:** table of contents, callouts, dark mode, search (`⌘K`), categories and tags, a yearly archive, and a bottom tab bar with bottom sheets on mobile
- **Comments:** giscus (GitHub Discussions). The original and its translation share one thread.
- **SEO:** canonical URLs, Open Graph, JSON-LD, sitemap, RSS
- **Publishing guards:** a post without a review record can't be published, and the build check fails if a draft ends up in the deployed output.
- **LinkedIn sharing:** only the English posts I choose are posted automatically after deployment.
- **Post data:** published posts are available at [`/data/posts.json`](https://jcheyoon.github.io/data/posts.json). It is the data source for a public MCP server ([blog-backend](https://github.com/JCheyoon/blog-backend), Go) that will let readers search posts from their own AI apps. The server is still in progress.

## Why Korean and English have separate URLs

Instead of switching languages on one URL, each language has its own (`/post/…` and `/en/post/…`).

- Google recommends different URLs for each language. Its crawler mostly visits from the US and doesn't send a language setting, so if the content changes with that setting, some languages can be missed in search ([Google docs](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)).
- Pages whose main content is translated aren't treated as duplicate content. Each pair points to each other with `hreflang`, and the build check verifies that every `hreflang` link on a page points to a page that links back ([Google docs](https://developers.google.com/search/docs/specialty/international/localized-versions)).
- The language never changes automatically; readers pick it with a link. As a static site, it also can't serve different content based on a visitor's language.
- Because the URLs are separate, a shared link shows the title and description in that language.

**Code is shared where possible.** For the home page, posts, and category and tag lists, a single `[...lang]` route file builds both languages. For the archive, each language has its own file that renders the same component. About, contact, privacy, and terms have different text, so each language writes it in its own file.

## How a post gets published

```
draft ── review ──▶ reviewed ── publish ──▶ translation draft ── translation review ──▶ published (ko + en)
                                                                                          │
                                        PR checks → merge → deploy → (optional) LinkedIn post
```

AI-written drafts and translations move forward only after I approve them. Nothing is generated or published on a schedule.

## Blog MCP server

When you open this repository in Claude Code, the server in [`mcp/`](mcp/) is configured through [`.mcp.json`](.mcp.json).

| Tool | What it does |
|---|---|
| `list_posts`, `check_post`, `list_templates` | List posts, check a post against the rules, list templates |
| `create_draft` | Creates a new post file, always as `draft` |
| `translate_post` | Saves a translation draft of a published post |

It never commits, pushes, or promotes a post's status. The site build, the check script, and the MCP server all share one rule file, [`src/lib/content-rules.ts`](src/lib/content-rules.ts).

## Project structure

```
src/
  content/posts/     posts (Korean); English posts are in posts/en/
  content/templates/ post templates
  pages/             routes
  components/        .astro components
  lib/               post queries, content rules, Markdown plugins, OG images
mcp/                 blog MCP server
scripts/             content and HTML checks, search index, LinkedIn posting
docs/                spec, roadmap, translation glossary
```

## Running locally

Requires Node 24.22.2 (see [`.nvmrc`](.nvmrc)).

```sh
npm install
npm run dev      # dev server, drafts included
npm run verify   # content checks, tests, type check, builds, HTML checks
```

Search only works on a build, not on the dev server.

## Docs

These are written in Korean.

- [Spec and decision log](docs/SPEC.md)
- [Roadmap](docs/ROADMAP.md)
- [Translation glossary](docs/translation-glossary.md)
