# CHEYOON

[English](README.md) · 한국어

소프트웨어를 만들며 직접 겪은 문제와 해결을 기록하는 블로그입니다.

**블로그:** https://jcheyoon.github.io · [English](https://jcheyoon.github.io/en/)

글 초안, 검사, 번역은 이 저장소의 **MCP 서버**와 Claude Code로 하고, 발행은 작성자가 검수한 뒤에만 합니다.

## 기술 스택

| 영역 | 사용 |
|---|---|
| 사이트 | Astro 7(정적 생성), TypeScript, Tailwind CSS 4 |
| 본문 | Markdown + git |
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

## 왜 한국어와 영어의 주소를 나눴나

한 주소에서 언어를 바꾸지 않고, 언어마다 주소를 따로 둡니다(`/post/…`, `/en/post/…`).

- Google은 언어마다 다른 주소를 권장합니다. Google의 수집기는 대부분 미국에서 접속하고 언어 설정을 보내지 않아, 설정에 따라 내용이 바뀌면 일부 언어가 검색에서 빠질 수 있습니다([Google 문서](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)).
- 본문까지 번역한 페이지는 중복 콘텐츠로 보지 않습니다. 두 페이지는 `hreflang`으로 서로를 가리키고, 빌드 검사는 페이지에 있는 `hreflang` 링크의 대상이 되돌아 가리키는지 확인합니다([Google 문서](https://developers.google.com/search/docs/specialty/international/localized-versions)).
- 언어를 자동으로 바꾸지 않고 링크로 고릅니다. 정적 호스팅이라 방문자의 언어에 따라 다른 내용을 내려 줄 수도 없습니다.
- 주소가 나뉘어 있어 공유하면 그 언어의 제목과 설명이 보입니다.

**코드는 가능한 한 함께 씁니다.** 홈, 글, 카테고리·태그 목록은 `[...lang]` 라우트 파일 하나가 두 언어를 만듭니다. 기록 페이지는 언어별 파일이 같은 컴포넌트를 부릅니다. 소개, 문의, 처리방침, 약관은 문장이 달라서 언어별 파일에 따로 적습니다.

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
```

## 문서

- [요구사항과 결정 기록](docs/SPEC.md)
- [로드맵](docs/ROADMAP.md)
- [번역 표현집](docs/translation-glossary.md)
