# Project Guide

## Overview

This repository is a Vite + React + TypeScript blog application.
The app boots from [index.html](index.html), loads [src/main.tsx](src/main.tsx), and renders [src/App.tsx](src/App.tsx).

The public site uses nested React Router routes for the main pages, and there is a separate admin area for login, post management, and category management.

## Tech Stack

- Language: TypeScript
- Framework: React 19, Vite
- Routing: react-router-dom
- Server state: @tanstack/react-query
- Styling: Tailwind CSS, Tailwind Vite plugin, shadcn-style UI primitives
- Editors and icons: Tiptap, lucide-react
- UI primitives: Radix Select and Popover

## Directory Structure

- `src/App.tsx`: creates the router and wraps the app with API, query, and admin auth providers.
- `src/components/pages/`: public pages such as Home, About, Archive, Portfolio, and Post.
- `src/components/admin/`: admin login, dashboard, editor, category manager, auth provider, and route guard.
- `src/components/home/`: home-page post list components.
- `src/components/post/`: post card rendering.
- `src/components/routing/`: shared site shell and layout components.
- `src/components/ui/`: shared app UI pieces such as the navbar, sidebar, footer, and SVG helpers.
- `src/shadcn-ui/components/ui/`: low-level reusable primitives such as button, card, input, select, and separator.
- `src/lib/`: API client, post/category fetchers, admin auth helpers, and category cache logic.
- `src/types/`: shared domain types for posts, categories, and outlet context.
- `public/`: static assets served directly by Vite, including `site.webmanifest`.
- Root config files: `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `tailwind.config.js`, and `components.json`.

## Build, Run, and Preview

- `npm run dev`: start the Vite development server.
- `npm run build`: run TypeScript build mode and create the production bundle.
- `npm run lint`: run ESLint across the repository.
- `npm run preview`: preview the built app locally.
- `npm run deploy`: publish `dist/` through `gh-pages`.

There is no dedicated `test` script in `package.json`.

## Coding Conventions and Architecture

- Use the `@/` alias for imports from `src/`. The repo also maps `@repo/` to `src/` in Vite and TypeScript config.
- TypeScript is strict. `noUnusedLocals`, `noUnusedParameters`, and other strict compiler checks are enabled.
- Route composition lives in `src/App.tsx`; page components should stay focused on view logic and use hooks or helpers for data access.
- Server data is fetched with TanStack Query through the shared API layer in `src/lib/api.ts`.
- Public category data is cached indefinitely through `src/lib/category-cache.ts` and must be invalidated after admin category mutations.
- Admin authentication tokens are stored in `window.localStorage` under `blog.admin.token` and are parsed client-side for JWT payload checks.
- The API base URL is read from `import.meta.env.VITE_API_BASE_URL` in `src/lib/api.ts`.
- Admin and post content uses HTML returned from the backend and rendered with `dangerouslySetInnerHTML` or the Tiptap editor, so upstream content safety matters.
- Styling is implemented with Tailwind utility classes and the shared UI primitives rather than ad hoc CSS.

## Claude Workspace (.claude/)

- Detailed, code-verified rules live in `.claude/rules/` (coding style, architecture, naming, API conventions, environment/tooling).
- Repetitive workflows (API fetcher addition, data-driven components, UI components, project verification) are defined as skills in `.claude/skills/*/SKILL.md`. Load them for multi-step tasks as noted in `AGENTS.md`.
- `.claude/settings.json` holds permission defaults (allow/ask/deny), allowed tools, and the default `VITE_API_BASE_URL` env value.
- See `.claude/README.md` for the full structure and usage notes.

## Notes for Future Work

- Set `VITE_API_BASE_URL` in your environment before running the app if the backend is not exposed at the default empty base.
- Do not change `blog.admin.token` without migrating existing localStorage sessions.
- Keep `src/lib/api.ts` and `src/lib/category-cache.ts` as the central control points for network access and category invalidation.
- When changing admin category mutations, make sure the category cache is invalidated so the public sidebar updates.
- `src/components/admin/textEditor.tsx` prompts for image and link URLs with `window.prompt`; account for that behavior if the editor UX changes.
- Prefer small focused edits in the relevant feature folder rather than broad refactors across unrelated pages.
