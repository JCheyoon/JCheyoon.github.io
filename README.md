# CHEYOON

소프트웨어를 만들며 직접 겪은 문제와 해결을 기록하는 블로그입니다.

**블로그:** https://jcheyoon.github.io · [English](https://jcheyoon.github.io/en/)

글 초안, 검사, 번역은 이 저장소의 **MCP 서버**와 Claude Code로 하고, 발행은 작성자가 검수한 뒤에만 합니다.
React SPA에서 Astro로 옮긴 이유는 [블로그 글](https://jcheyoon.github.io/post/why-astro/)에 정리했습니다.

## 기술 스택

| 영역 | 사용 |
|---|---|
| 사이트 | Astro 7(정적 생성), TypeScript, Tailwind CSS 4 |
| 본문 | Markdown + git. frontmatter는 Zod 스키마로 검사, 코드 블록은 Expressive Code |
| 검색 | Pagefind(빌드 때 색인 생성) |
| 미리보기 이미지 | Satori + resvg로 글마다 1200×630 PNG 생성 |
| 글 작성 도구 | MCP TypeScript SDK(stdio 서버) |
| 배포 | GitHub Actions → GitHub Pages |

## 주요 기능

- **한국어·영어:** 한국어는 `/`, 영어는 `/en/`. 원문과 번역본을 `hreflang`으로 연결하고, 번역본에는 AI 번역 안내를 표시합니다.
- **읽기 화면:** 목차, 안내 상자, 다크 모드, 검색(`⌘K`), 카테고리·태그, 연도별 기록, 모바일 하단 탭과 바텀 시트
- **SEO:** canonical, Open Graph, JSON-LD, sitemap, RSS
- **발행 안전장치:** 검수 기록이 없는 글은 발행 상태가 될 수 없고, 초안이 배포 결과물에 섞이면 빌드 검사가 실패합니다.
- **LinkedIn 공유:** 작성자가 고른 영어 글만 배포 뒤 자동으로 게시합니다.
- **글 데이터:** [`/data/posts.json`](https://jcheyoon.github.io/data/posts.json)에 발행한 글을 제공합니다. 독자가 자기 AI 앱에서 글을 검색할 수 있는 공개 MCP 서버([blog-backend](https://github.com/JCheyoon/blog-backend), Go)가 읽을 데이터이며, 서버는 만드는 중입니다.

## 글이 발행되는 흐름

```
초안 (draft) ── 검수 ──▶ reviewed ── 발행 ──▶ 번역 초안 ── 번역 검수 ──▶ 한국어·영어 published
                                                                            │
                                             PR 검증 → merge → 배포 → (선택) LinkedIn 게시
```

AI가 만든 초안과 번역본은 작성자가 승인해야 다음 단계로 갑니다. 자동 생성이나 예약 발행은 하지 않습니다.

## 블로그 MCP 서버

이 저장소를 Claude Code로 열면 [`.mcp.json`](.mcp.json) 설정으로 [`mcp/`](mcp/) 서버가 연결됩니다.

| 도구 | 하는 일 |
|---|---|
| `list_posts`, `check_post`, `list_templates` | 글 목록, 규칙 검사, 템플릿 목록 |
| `create_draft` | 새 초안 생성. 항상 `draft`로 만듭니다 |
| `translate_post` | 발행한 원문의 번역 초안 저장 |

commit, push, 상태 승격은 하지 않습니다. 글 규칙은 [`src/lib/content-rules.ts`](src/lib/content-rules.ts) 하나를 사이트 빌드, 검사 스크립트, MCP 서버가 함께 씁니다.

## 로컬에서 실행

Node 24.22.2([`.nvmrc`](.nvmrc))를 씁니다.

```bash
npm ci
npm run dev
```

http://localhost:4321 에서 초안 글까지 볼 수 있습니다.

| 명령 | 하는 일 |
|---|---|
| `npm run verify` | 콘텐츠 검사 → 테스트 → 타입 검사 → 두 종류 빌드와 HTML 검사 |
| `npm run build` / `npm run preview` | 배포용 빌드(발행한 글만)와 미리보기 |

검색은 개발 서버에서 동작하지 않습니다. 초안까지 검색해 보려면 아래처럼 실행합니다.

```bash
npm run build:drafts && INCLUDE_DRAFTS=true npx astro preview
```

## 폴더 구조

```
src/
  content/posts/     글 (한국어). 영어는 posts/en/
  content/templates/ 글 템플릿
  pages/             라우트
  components/        .astro 컴포넌트
  lib/               글 조회, 글 규칙, Markdown 플러그인, OG 이미지
mcp/                 블로그 MCP 서버
scripts/             콘텐츠·HTML 검사, 검색 색인, LinkedIn 게시
docs/                요구사항(SPEC), 로드맵, 번역 표현집
.claude/             Claude Code 규칙과 스킬
.github/workflows/   검증·배포, LinkedIn 토큰 만료 알림
```

## 문서

- [요구사항과 결정 기록](docs/SPEC.md)
- [로드맵](docs/ROADMAP.md)
- [번역 표현집](docs/translation-glossary.md)
