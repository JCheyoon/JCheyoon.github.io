# Project Guide

## 현재 상태: Astro 이전 진행 중 (먼저 읽을 것)

- 무엇을 만들고, 어떤 순서로 하는지는 [docs/SPEC.md](docs/SPEC.md)와 [docs/ROADMAP.md](docs/ROADMAP.md)가 기준이다. 작업 전에 ROADMAP의 "현재 단계"를 확인한다.
- 아래 "Legacy SPA" 섹션은 **레거시 SPA**(Vite + React, 관리자 포함)에 대한 설명이다.
  - 이 앱은 `legacy/spa/`로 옮겨 은퇴했다(SPEC D6, D7). 섹션에 나오는 경로는 모두 `legacy/spa/` 기준이다.
  - 레거시 SPA의 버그는 고치지 않고, 빌드하거나 배포하지 않는다.
- 글은 Markdown + git으로 관리하고, draft → reviewed → published를 거친다.
  - 규칙: [.claude/rules/content.md](.claude/rules/content.md)
  - 스킬: `draft-post`, `review-post`, `publish-post`
- push와 PR 생성은 `create-pr` 스킬로 한다(한글 PR, AI 작성 표시 없음). push 전에 반드시 PR 초안을 보여 주고 승인을 받는다. merge와 배포는 사람이 한다.
- 라이브 사이트는 `gh-pages` 브랜치에서 서빙된다. Phase 1 전환 전까지 `npm run deploy`를 실행하지 않는다(SPEC §3.1).

## Legacy SPA (`legacy/spa/`)

All paths in this section and the sections below up to "Claude Workspace" are relative to `legacy/spa/`.

### Overview

This repository is a Vite + React + TypeScript blog application.
The app boots from [index.html](index.html), loads [src/main.tsx](src/main.tsx), and renders [src/App.tsx](src/App.tsx).

The public site uses nested React Router routes for the main pages, and there is a separate admin area for login, post management, and category management.

### Tech Stack

- Language: TypeScript
- Framework: React 19, Vite
- Routing: react-router-dom
- Server state: @tanstack/react-query
- Styling: Tailwind CSS, Tailwind Vite plugin, shadcn-style UI primitives
- Editors and icons: Tiptap, lucide-react
- UI primitives: Radix Select and Popover

### Directory Structure

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

### Build, Run, and Preview

- `npm run dev`: start the Vite development server.
- `npm run build`: run TypeScript build mode and create the production bundle.
- `npm run lint`: run ESLint across the repository.
- `npm run preview`: preview the built app locally.
- `npm run deploy`: publish `dist/` through `gh-pages`. Do not run before the Phase 1 cutover (docs/SPEC.md §3.1).

Note: as of 2026-11-23, `npm run build` fails on two TypeScript errors (`src/components/post/postCard.tsx`, `src/lib/api-context.tsx`). These are left unfixed because the SPA is being retired.

There is no dedicated `test` script in `package.json`.

### Coding Conventions and Architecture

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

- Rules live in `.claude/rules/`.
  - Content, scope, and SEO rules: `content.md`, `project-scope.md`, `rendering-seo.md`.
  - Legacy SPA code rules: coding style, architecture, naming, API conventions, environment/tooling.
- Skills use the `.claude/skills/<name>/SKILL.md` layout: one folder per skill, containing a file named exactly `SKILL.md`. Other layouts are not discovered.
  - Content and workflow: `draft-post`, `review-post`, `publish-post`, `create-pr`.
  - Legacy SPA only (do not use for new code): `add-api-fetcher`, `add-data-driven-component`, `create-ui-component`, `verify-project`.
- `.claude/settings.json` holds permission defaults (allow/ask/deny), allowed tools, and the default `VITE_API_BASE_URL` env value.
- See `.claude/README.md` for the full structure and usage notes.

## Notes for Future Work

- Set `VITE_API_BASE_URL` before running the app. If it is unset, `src/lib/api.ts` calls `.trim()` on `undefined` and the first request throws. There is no empty-string fallback.
- Do not change `blog.admin.token` without migrating existing localStorage sessions.
- Keep `src/lib/api.ts` and `src/lib/category-cache.ts` as the central control points for network access and category invalidation.
- When changing admin category mutations, make sure the category cache is invalidated so the public sidebar updates.
- `src/components/admin/textEditor.tsx` prompts for image and link URLs with `window.prompt`; account for that behavior if the editor UX changes.
- Prefer small focused edits in the relevant feature folder rather than broad refactors across unrelated pages.
