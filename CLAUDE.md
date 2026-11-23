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

## 작업 원칙

모든 작업에 적용한다. LLM이 자주 하는 실수(근거 없는 가정, 과한 설계, 요청과 무관한 수정)를 줄이기 위한 원칙이다.
출처: Andrej Karpathy의 관찰을 정리한 [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)를 이 저장소에 맞게 옮겼다.

### 1. 코딩 전에 생각한다
가정하지 않는다. 헷갈리는 것을 숨기지 않는다. 장단점을 드러낸다.
- 가정은 명시한다. 확실하지 않으면 추측하지 말고 묻는다.
- 해석이 여러 가지면 하나를 몰래 고르지 말고, 해석들을 제시한다.
- 더 단순한 방법이 있으면 말한다. 필요하면 반대 의견을 낸다.
- 헷갈리면 멈추고, 무엇이 불분명한지 말하고 묻는다.
- 이 저장소에서는: SPEC에 없는 결정(URL, 필드, 페이지 구조)은 구현하지 말고 질문한다(`project-scope.md`).

### 2. 단순함이 먼저다
문제를 푸는 최소한의 코드만 쓴다. 미래를 짐작한 코드는 쓰지 않는다.
- 요청받지 않은 기능은 넣지 않는다. 현재 로드맵 단계에 없는 기능도 마찬가지다.
- 한 번만 쓰는 코드에 추상화를 만들지 않는다.
- 요청받지 않은 "유연성"이나 "설정 가능성"을 넣지 않는다.
- 일어날 수 없는 상황에 대한 에러 처리를 넣지 않는다.
- 200줄을 50줄로 쓸 수 있으면 다시 쓴다.
- 기준: 시니어 엔지니어가 보고 "너무 복잡하다"고 할까? 그렇다면 단순하게 고친다.

### 3. 수술하듯 고친다
꼭 필요한 곳만 건드린다. 내가 만든 흔적만 정리한다.
- 주변 코드, 주석, 포맷을 "개선"하지 않는다.
- 고장 나지 않은 것을 리팩터링하지 않는다.
- 내 취향과 달라도 기존 스타일에 맞춘다.
- 관련 없는 죽은 코드를 발견하면 알리기만 하고 지우지 않는다.
- 내 변경 때문에 쓰이지 않게 된 import, 변수, 함수는 지운다. 원래 있던 죽은 코드는 요청이 없으면 지우지 않는다.
- 기준: 바뀐 모든 줄이 사용자의 요청으로 설명되어야 한다.

### 4. 목표를 정하고 검증될 때까지 반복한다
성공 기준을 먼저 정한다. 지시를 검증 가능한 목표로 바꾼다.
- 이 저장소에는 테스트 프레임워크가 없다. 검증 수단은 `npm run verify`(콘텐츠 검사, `astro check`, 두 종류 빌드, HTML 검사)다.
- "검사를 추가해" → 규칙을 어긴 샘플을 만들어 검사가 실패하는지 보고, 정상일 때 통과하는지 본다.
- "버그를 고쳐" → 먼저 재현한다(검사 실패, 샘플 글, 빌드 결과물의 특정 HTML). 그다음 고치고, 재현이 사라졌는지 확인한다.
- "리팩터링해" → 전과 후에 `npm run verify`가 통과하고, 빌드 결과물이 의도한 만큼만 달라졌는지 확인한다.
- 여러 단계 작업은 짧은 계획을 먼저 적는다.
  ```
  1. [단계] → 확인: [무엇으로]
  2. [단계] → 확인: [무엇으로]
  ```

### 적용 범위
- 이 원칙은 속도보다 신중함을 우선한다. 오타나 한 줄 수정처럼 사소한 작업에는 판단껏 적용한다.
- 목표는 사소한 작업을 느리게 만드는 것이 아니라, 큰 작업에서 비싼 실수를 줄이는 것이다.
- 이 원칙이 잘 지켜지면 diff에 요청한 변경만 남고, 질문이 실수 뒤가 아니라 구현 전에 나온다.

## 사이트 (Astro)

### 스택
- Astro 7(정적 생성), TypeScript, Tailwind CSS 4 + typography 플러그인
- 통합: `@astrojs/sitemap`, `@astrojs/rss`
- 버전은 `package.json`에 정확히 고정한다.
- Node는 24.22.2로 고정한다. 값의 기준은 `.nvmrc`이고, `package.json`의 `engines`와 CI(`node-version-file: .nvmrc`)가 같은 값을 쓴다. 버전을 올릴 때는 세 곳을 같은 커밋에서 바꾼다.

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
