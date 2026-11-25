---
paths:
  - "src/**"
  - "scripts/**"
  - "astro.config.mjs"
---

# 사이트 코드 규칙 (Astro)

Phase 1에서 만든 코드를 기준으로 정리했다(2026-11-23). 레거시 SPA 규칙은 `legacy/**`에만 적용된다.

## 구조

| 위치 | 역할 |
|---|---|
| `src/pages/` | 라우트. 동적 라우트는 `getStaticPaths`로 만든다(SSG) |
| `src/layouts/BaseLayout.astro` | 모든 페이지의 껍데기(SEO head, 헤더, 사이드바, 푸터) |
| `src/components/` | `.astro` 컴포넌트. 파일명은 PascalCase |
| `src/lib/posts.ts` | 글 조회·정렬·주소·날짜 헬퍼 |
| `src/lib/markdown.ts` | 본문 Markdown 플러그인(Sätteri mdast·hast). remark·rehype 플러그인은 쓰지 않는다. 바꾼 뒤에는 `node_modules/.astro`를 지우고 빌드한다(글 내용이 그대로면 Astro가 이전 변환 결과를 캐시에서 다시 쓴다) |
| `src/content.config.ts` | frontmatter 스키마 |
| `src/site.config.ts`, `src/data/` | 사이트 정보, 카테고리 등 단일 소스 |
| `scripts/` | 검사 스크립트. Node가 빌드 없이 실행한다(`.ts`는 type stripping). 외부 패키지는 `yaml`과 `astro/zod`만 쓴다 |
| `src/lib/content-rules.ts` | 글 스키마와 검사 규칙. 사이트·검사·MCP 서버 공통. `astro:` 모듈을 쓰지 않고, 상대 경로 import에 `.ts`를 붙인다 |

## 글 데이터
- 글 목록은 항상 `getVisiblePosts()`로 가져온다. `getCollection("posts")`를 페이지에서 직접 부르지 않는다. 초안 공개 여부가 그 함수 한 곳에서 결정된다.
- 글 주소는 `postUrl()`, 목록 주소는 `listPageUrl()`로 만든다. 문자열로 직접 조합하지 않는다.
- 날짜 표시는 `formatDate()`(언어별, Asia/Seoul), 아카이브의 월·일은 `formatMonthDay()`, `<time datetime>`은 `isoDate()`를 쓴다.

## 마크업과 스타일
- 기본은 JS 없는 정적 HTML이다. `client:*` 아일랜드는 SPEC §8에 적힌 것만 쓴다.
- 링크는 `<a href>`이고, 주소는 끝 슬래시를 붙인다(D5).
- 스타일은 Tailwind 유틸리티와 `src/styles/global.css`의 토큰(`bg-card`, `text-muted-foreground`, `bg-accent-bar` 등)을 쓴다. 색을 하드코딩하지 않는다. 로고의 청록색(#5f9e9f)과, CSS 변수를 쓸 수 없는 OG 이미지(`src/lib/og.ts`, 토큰 값을 옮겨 적고 토큰 이름을 주석으로 단다)만 예외다.
- 본문은 `prose prose-slate dark:prose-invert`로 감싼다. 글 본문에는 `post-body`를 더해 SPEC §6.1 스타일을 입힌다(`global.css`).
- 컴포넌트 Props는 `interface Props`로 선언한다. 다른 파일에서 쓸 때만 `export`한다.

## 문자열
- 화면 문구는 한국어로 쓴다. 코드 주석은 한국어로 "왜"를 적는다.
- 따옴표는 큰따옴표, 문장 끝 세미콜론을 쓴다.
