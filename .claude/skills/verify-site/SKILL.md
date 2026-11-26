---
name: verify-site
description: Astro 사이트 변경 후 검증한다(콘텐츠 검사, 타입 검사, 템플릿 검증 빌드, 배포 빌드, HTML 검사). 코드·글·설정을 바꾼 뒤, 커밋 전, create-pr 전에 사용한다.
---

# 사이트 검증

## 실행

```bash
ASTRO_TELEMETRY_DISABLED=1 npm run verify
```

`verify`는 아래를 순서대로 실행한다. 하나라도 실패하면 멈춘다.

| 단계 | 명령 | 확인하는 것 |
|---|---|---|
| 1 | `npm run check:content` | slug = 파일명, 보완 표시(`[경험 추가 필요]`, `[출처 확인 필요]`), 제휴 링크 표시, 이미지 alt·외부 이미지. reviewed·published 글은 실패, draft는 경고 |
| 2 | `npm run test:mcp`, `npm run test:linkedin` | 블로그 MCP 서버 도구, LinkedIn 게시 대상 선정과 요청 형식(LinkedIn은 호출하지 않는다) |
| 3 | `npm run check` | `astro check` 타입 검사, frontmatter 스키마(`src/content.config.ts`) |
| 4 | `npm run build:drafts` + `check-html dist-drafts --drafts` | 초안까지 포함해 템플릿을 검증한다. 글 페이지가 1개 이상 있어야 한다(`template-check` 샘플) |
| 5 | `npm run build` + `check-html dist` | 배포 결과물: title·description·canonical·OG·lang, 내부 링크, 바깥 링크의 새 탭 열기, img alt, 404 noindex, 초안이 결과물·sitemap·RSS·`/data/posts.json`에 없는지 |

## 실패했을 때

- **스키마 오류**(`InvalidContentEntryDataError`): 메시지의 필드를 SPEC §5.1에 맞춘다.
  - 상태별 필수값이 빠진 경우 직접 채우지 않는다. `review-post`·`publish-post` 절차를 밟는다.
- **canonical 경로가 다름**: 링크와 주소는 끝 슬래시가 붙어야 한다(D5). 예: `/post/slug/`.
- **내부 링크가 결과물에 없음**: 아직 없는 페이지로 링크를 걸었다. 링크를 빼거나 페이지를 만든다. 동작하지 않는 UI는 두지 않는다.
- **초안이 배포 결과물에 있음**: `getVisiblePosts()`(`src/lib/posts.ts`)를 거치지 않고 `getCollection`을 직접 쓴 곳이 있는지 찾는다.

## 화면 확인

- 개발 서버: `npm run dev`. 초안도 보인다.
- 배포본 미리보기: `npm run build && npm run preview`. published 글만 보인다.
- 모바일은 브라우저 개발자 도구에서 375px로 확인한다.

## 보고

검증 결과를 보고할 때는 실제로 실행한 명령과 출력의 요약을 적는다. 실행하지 않은 단계를 통과라고 쓰지 않는다.
