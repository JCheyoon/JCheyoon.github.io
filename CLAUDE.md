# Project Guide

## 현재 상태 (먼저 읽을 것)

- 무엇을 만들고, 어떤 순서로 하는지는 [docs/SPEC.md](docs/SPEC.md)와 [docs/ROADMAP.md](docs/ROADMAP.md)가 기준이다. 작업 전에 ROADMAP의 "현재 단계"를 확인한다.
- 사이트는 저장소 루트의 **Astro 정적 사이트**다. 아래 "사이트 (Astro)" 섹션을 본다.
- `legacy/spa/`는 은퇴한 Vite + React SPA(관리자 포함)다(SPEC D6, D7). 버그를 고치지 않고, 빌드하거나 배포하지 않는다.
- 글은 Markdown + git으로 관리하고, draft → reviewed → published를 거친다.
  - 규칙: [.claude/rules/content.md](.claude/rules/content.md)
  - 스킬: `draft-post`, `review-post`, `publish-post`
- push와 PR 생성은 `create-pr` 스킬로 한다(한글 PR, AI 작성 표시 없음). push 전에 반드시 PR 초안을 보여 주고 승인을 받는다. merge와 배포는 사람이 한다.
- 라이브 사이트는 전환(Phase 1 마지막) 전까지 `gh-pages` 브랜치에서 서빙된다. `legacy/spa/`에서 `npm run deploy`를 실행하지 않는다(라이브 사이트를 덮어쓴다). SPEC §3.1 참고.

## 사이트 (Astro)

### 스택
- Astro 7(정적 생성), TypeScript, Tailwind CSS 4 + typography 플러그인
- 통합: `@astrojs/sitemap`, `@astrojs/rss`
- 버전은 `package.json`에 정확히 고정한다. Node 22.23.4 이상(CI는 24)

### 명령
- `npm run dev`: 개발 서버. draft 글도 보인다.
- `npm run verify`: 콘텐츠 검사 → `astro check` → 템플릿 검증 빌드(`dist-drafts/`) → 배포 빌드(`dist/`) → HTML 검사. 자세한 내용은 `verify-site` 스킬.
- `npm run build` / `npm run preview`: 배포 빌드와 미리보기. published 글만 들어간다.
- 로컬에서는 `ASTRO_TELEMETRY_DISABLED=1`을 붙여 사용 통계 전송을 끈다(CI에는 설정되어 있다).

### 디렉터리
- `src/content/posts/<slug>.md`: 글. frontmatter 스키마는 `src/content.config.ts`(SPEC §5.1)
- `src/assets/posts/<slug>/`: 글 이미지(SPEC §5.4)
- `src/pages/`: 라우트. `/`, `/page/[page]/`, `/post/[slug]/`, `/category/[slug]/`, `/about/`, `/404`, `/rss.xml`, `/robots.txt`
- `src/layouts/`, `src/components/`: 레이아웃과 `.astro` 컴포넌트
- `src/lib/posts.ts`: 글 조회(`getVisiblePosts`)와 주소·날짜 헬퍼
- `src/site.config.ts`, `src/data/`: 사이트 정보, 카테고리, 제휴 도메인(단일 소스)
- `scripts/`: `check-content.mjs`, `check-html.mjs`
- `.github/workflows/site.yml`: PR 검증, 수동 배포. 전환 때 master push 자동 배포를 켠다.
- `public/`: 파비콘, 매니페스트

### 주의
- `src/content/posts/template-check.md`는 템플릿 검증용 샘플이다. 항상 `status: draft`로 둔다(check-content가 확인한다).
- 주소는 끝 슬래시를 붙인다(D5): `/post/slug/`.
- 코드 규칙: `.claude/rules/site-code.md`, `.claude/rules/rendering-seo.md`

## Legacy SPA (`legacy/spa/`)

이 섹션의 경로는 모두 `legacy/spa/` 기준이다. 참고용으로만 남겨 둔다.

### Overview

Vite + React + TypeScript 블로그 앱이었다. `index.html` → `src/main.tsx` → `src/App.tsx` 순서로 부팅하고, 공개 페이지(React Router)와 관리자 영역(로그인, 글 관리, 카테고리 관리)이 있었다. 글은 Go 백엔드(blog-backend)의 Supabase DB에서 HTML로 받아왔다.

### Tech Stack
- React 19, Vite, react-router-dom, @tanstack/react-query
- Tailwind CSS, shadcn 스타일 프리미티브, Tiptap 에디터, lucide-react, Radix Select·Popover

### Known issues (고치지 않음)
- `npm run build`가 타입 에러 2개(`src/components/post/postCard.tsx`, `src/lib/api-context.tsx`)로 실패한다.
- `VITE_API_BASE_URL`이 비어 있으면 첫 요청에서 `undefined.trim()` 예외가 난다.
- 관리자 대시보드는 `/api/posts?all=true`(공개 라우트)를 불러서 초안이 보이지 않는다.

상세 규칙은 `paths: legacy/**`가 붙은 `.claude/rules/` 문서(architecture, api-conventions, coding-style, naming-convention, environment-and-tooling)에 있다.

## Claude Workspace (.claude/)

- 규칙: `.claude/rules/`
  - 항상 로드: `content.md`(콘텐츠), `project-scope.md`(범위·브랜치·PR)
  - 사이트 코드 작업 시: `site-code.md`, `rendering-seo.md`
  - 레거시 작업 시(`legacy/**`): architecture, api-conventions, coding-style, naming-convention, environment-and-tooling
- 스킬은 `.claude/skills/<이름>/SKILL.md` 형식이어야 인식된다.
  - 콘텐츠·작업 흐름: `draft-post`, `review-post`, `publish-post`, `create-pr`, `verify-site`
  - 레거시 전용(새 코드에 쓰지 않음): `add-api-fetcher`, `add-data-driven-component`, `create-ui-component`, `verify-project`
- `.claude/settings.json`: 권한 기본값(allow/ask/deny)
- 구조 설명: `.claude/README.md`
