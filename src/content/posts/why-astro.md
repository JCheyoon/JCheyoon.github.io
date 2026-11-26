---
title: "블로그를 React SPA에서 Astro로 옮긴 이유"
slug: why-astro
description: 개인 블로그를 React SPA에서 Astro로 옮기며 SSR 대신 SSG를, Next.js와 Jekyll 대신 Astro를 고른 이유와 그 대가를 정리했다.
category: frontend
tags:
  - astro
  - ssg
status: published
lang: ko
ai_assisted: false
audience: 개인 기술 블로그를 만들면서 많이 사용되는 Next.js, Jekyll, Astro 사이에서 고민하는 개발자
search_intent: 개인 블로그에 SPA, SSR, SSG 중 무엇이 맞는지, Astro를 고를 이유가 있는지 알고 싶다
created_at: 2026-11-26
reviewed_at: 2026-11-26
reviewed_by: cheyoon
review_notes: review-post 8개 항목 통과
published_at: 2026-11-26
updated_at:
disclosure:
cover:
  src: ../../assets/posts/why-astro/cover.png
  alt: "React SPA에서 Astro SSG로 옮기는 것을 나타낸 그림. 왼쪽 React(SPA) 창에서 오른쪽 Astro(SSG) 창으로 화살표가 향하고, 아래에 GitHub 로고가 있는 노트북이 있다"
---
미루고 미루던 깃허브 블로그 만들기를 다시 시작하기로 했다. 
내용이 merge할 때만 바뀌는 개인 블로그라면 **SSG** 가 맞다고 판단했다. 그중 Astro를 고른 가장 큰 이유는 사이트와 글 검사 도구를 TypeScript 하나로 만들고 규칙 파일 하나를 함께 쓸 수 있어서이다. 이 글은 기존 React SPA였던 이 블로그를 Astro로 옮기면서 블로그에 많이 사용되는 Next.js, Jekyll을 각각 왜 고르지 않았는지 정리한다.

## 먼저 용어: 렌더링 방식과 프레임워크는 다른 축이다

| 용어 | 뜻|
|---|---|
| SPA | 앱 구조. 페이지 하나로 시작해 화면을 JS로 바꾼다 |
| CSR | 렌더링 방식. 브라우저가 JS로 HTML을 만든다 |
| SSR | 요청이 올 때 서버가 만든다 |
| SSG | 배포 전에 빌드가 미리 만든다 |
| ISR | 미리 만들어 두고, 정해진 주기마다 서버가 다시 만든다 |

프레임워크는 이 방식들을 골라 쓰게 해 주는 도구라서, 아래에서는 렌더링 방식과 도구를 나눠서 본다.

## 처음에는 왜 SPA였을까

블로그를 처음 만들 때 후보는 Next.js와 Jekyll이었다. 많은 사람들이 SEO에 유리하다고들 하는 Next.js의 서버 사이드 렌더링은 정적 요소만 있는 개인 블로그에는 과한 설계라고 생각했다. 그리고 GitHub Pages의 기본 Jekyll 빌드는 버전과 플러그인이 제한되어 원하는 기능을 넣기 어려웠다([GitHub 문서](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll)). 그래서 많이 사용했던 Vite + React SPA를 골랐었고 그 당시에 백엔드를 연습하고 싶다는 생각을 해 브라우저가 Go로 만든 백엔드에 글을 요청해서 화면을 그리는 구조였다.

## 1. 왜 SPA를 버렸나

### 링크 미리보기

가장 결정적인 이유다. 글을 올리면 원할 때 LinkedIn에도 자동으로 공유되는 구조를 원했는데 이전 구조는 모든 주소에 같은 `index.html`을 내려 줘서 글마다 다른 제목, 설명, 이미지를 미리보기용 Open Graph(OG) 태그로 넣을 수 없었다.

LinkedIn은 공유 미리보기에 `og:title`, `og:image`, `og:description`, `og:url` 태그가 필요하다고 안내한다([LinkedIn 도움말](https://www.linkedin.com/help/linkedin/answer/a521928)).

물론 SPA에서도 주소마다 미리 렌더링하거나, CDN에서 응답 직전에 메타 태그를 끼워 넣으면 해결할 수 있다. 하지만 아래에서 말할 이유도 있었고 기존 방식을 살릴 이유는 그동안 들인 시간이 아깝다는 것뿐이었다. "딸깍" 으로 AI가 금방 다시 만들어 주는 시대에 매몰 비용은 더 이상 고민할 거리가 아니었다.

### 서버와 DB를 둘 이유가 사라짐

앞서 말했듯 처음에는 백엔드를 연습하고 싶었고 그래서 관리자 페이지에서 TinyMCE로 글을 작성하면 백엔드 API를 통해 DB에 저장하고 불러오는 구조로 만들었다. 하지만 운영 비용이 부담되어 무료로 쓸 수 있는 Supabase를 찾았는데, 무료 플랜은 일정 기간 사용하지 않으면 프로젝트가 일시 정지됐다. 지금 기준으로는 1주일 동안 쓰지 않으면 정지된다([Supabase 요금 안내](https://supabase.com/pricing)). 그래서 이를 막는 GitHub Actions까지 만들었다.

그런데 이쯤 하니 백엔드 연습용이라는 것 말고는 이 구조에 별 매력이 없다고 느껴졌다. 연습이야 다른 프로젝트로 하면 되는데 굳이? 라는 생각에 휩싸이게 된 것이다.

그래서 글을 Markdown 파일로 git에 두기로 했고 웹에서 로그인해 글을 쓰는 관리자 화면도 없애버리고 DB도 필요 없어졌다. 덕분에 운영 비용도 신경 써야 할 서버도 사라졌다.

## 2. 왜 SSR이 아니라 SSG인가

이 블로그는 GitHub Pages에 올리는데 GitHub Pages는 저장소의 HTML, CSS, JS 파일을 그대로 내려 주는 정적 호스팅이라 요청마다 서버 코드를 실행하지 않는다([GitHub 문서](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)). 게다가 이 블로그의 내용은 글을 merge할 때만 바뀌고 사람마다 다른 화면을 보여 줄 일도 없다. 서버를 두어서 얻는 것이 없으니 서버가 필요 없는 SSG가 더 맞는 판단이다.

## 3. 왜 Next.js가 아니라 Astro인가

사실 Next.js도 SSG를 할 수 있다! 설정에 `output: 'export'`를 넣으면 정적 파일로 내보낸다([Next.js 문서](https://nextjs.org/docs/app/guides/static-exports)). 그런데도 Astro를 고른 이유는 한 가지다.

- **글 형식 검사가 기본 기능:** Astro는 글 폴더와 frontmatter 규칙(스키마)을 등록해 두면, 규칙에 어긋난 글이 있을 때 빌드에서 오류를 낸다([Astro 문서](https://docs.astro.build/en/guides/content-collections/)). Next.js에서는 zod 같은 라이브러리로 같은 구조를 직접 만들어야 한다.

## 4. 왜 Jekyll이 아니라 Astro인가

Jekyll의 가장 큰 장점은 GitHub Pages가 기본으로 지원한다는 점이다. 저장소에 올리기만 하면 GitHub이 알아서 빌드해 준다. 하지만 이 기본 빌드에는 제약이 있다. 정해진 Jekyll 버전으로만 빌드되고 허용 목록에 없는 플러그인은 쓸 수 없다.

이 제약을 피하려면 GitHub Actions로 직접 빌드해야 하는데, 그 순간 Jekyll의 가장 큰 장점은 사라진다. 어차피 Actions로 빌드한다면 Jekyll을 고집할 이유가 없었다.

그래서 내게 더 맞는 도구를 고르기로 했다. Astro는 익숙한 JS/TS 생태계에서 쓸 수 있어 Ruby 환경을 따로 맞출 필요가 없고 빌드와 배포는 Actions로 직접 구성했는데 덕분에 배포 과정을 다시 연습하는 기회도 됐다.

무엇보다 사이트 빌드, 글 검사 스크립트, 글을 만드는 MCP 서버가 같은 TypeScript 규칙 파일을 읽는다. 그래서 규칙을 한 곳에서 고치면 모두에 적용된다.

## 5. 그외 다른 도구는 왜 고려하지 않았나

글 초안과 검사를 MCP 서버로 할 계획이어서 사이트, 글 검사 스크립트, MCP 서버가 같은 TypeScript 규칙 파일을 읽어야 했고, Hugo나 Zola처럼 다른 언어로 만든 도구는 후보에서 뺐다.
TypeScript를 쓸 수 있는 도구 중에서는 이렇게 걸렀다.

- **Nuxt, SvelteKit, VitePress:** Vue나 Svelte라는 새 UI 프레임워크를 익혀야 한다. 반면 Astro 컴포넌트는 HTML 위에 `{}` 표현식을 쓰는 방식이라, 익숙한 React 문법(JSX)과 비슷하게 쓸 수 있다([Astro 문서](https://docs.astro.build/en/reference/astro-syntax/)).
- **Docusaurus:** 익숙한 리액트 기반에 블로그 기능도 있지만 중심은 문서 사이트다. 디자인은 기본 테마 위에서 CSS로 고치는 방식이고 화면 구조를 깊게 바꾸려면 테마 컴포넌트를 내 코드로 바꿔 끼우는 swizzle을 해야 한다([Docusaurus 문서](https://docusaurus.io/docs/swizzling)). 이렇게 바꾼 컴포넌트는 Docusaurus를 업데이트할 때 직접 맞춰야 한다.

## SSG를 고른 대가

| 대가 | 지금 상태 |
|---|---|
| 글이 늘면 빌드 시간이 늘어난다 | 글마다 미리보기 이미지를 그리는 단계가 특히 무겁다. 지금은 글이 적어 문제없다 |
| 오타 하나도 전체 빌드와 배포를 거친다 | PR → merge → 검사 → 배포 순서다 |
| 예약 발행이 안 된다 | 정해진 시간에 빌드를 돌리는 설정이 없다. 필요하면 따로 만들어야 한다 |
| 동적 기능은 바깥에 맡긴다 | 검색은 빌드 때 만드는 색인(Pagefind) 댓글은 Giscus를 쓸 계획이다 |

## 결론

이 블로그는 내용이 merge할 때만 바뀌고 정적 호스팅에 올라가며 글에 미리보기 카드가 필요하다. 그중 Astro를 고른 이유는 사이트와 도구를 TypeScript 하나로 만들고 규칙 파일 하나를 함께 쓸 수 있다는 점이 가장 크다. 대가는 빌드 시간, 예약 발행, 동적 기능의 외부 의존이다.

