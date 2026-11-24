# 블로그 사양서 (SPEC)

- 상태: 승인된 초안 (2026-11-23, 2026-11-24 번역 방식·단계 순서 변경). D1~D3, D5~D8 결정. D4는 Phase 6에서 논의.
- 관련 문서: `docs/ROADMAP.md`, `.claude/rules/`
- 표시: [결정 필요]는 §11 열린 결정 표에 있는 항목

## 1. 목적

- 개발하면서 직접 겪은 문제와 해결을 기록하는 1인 기술 블로그.
- 검색 유입을 받고, 장기적으로 광고, 제휴, 자체 디지털 상품으로 수익을 낸다.
- AI가 초안을 돕고 사람이 검수해서 발행한다. 글 수보다 품질을 우선한다.

## 2. 범위

### v1에 포함

- 공개 페이지: 홈, 글, 카테고리, 태그, 아카이브, 소개, 문의, 개인정보 처리방침, 이용약관, 404
- SEO 기본: 페이지별 메타, sitemap, RSS, robots.txt, 구조화 데이터
- 콘텐츠 파이프라인: draft → reviewed → published, 빌드 시 검증
- GitHub Actions 정적 배포

### v1에서 제외

| 기능 | 이유 |
|---|---|
| 관리자 웹 에디터 | git과 PR이 작성·검수 도구를 대신한다. 기존 코드는 `legacy/`에 보관 |
| 다국어 페이지 | Phase 2에서 한국어 ↔ 영어 번역 구조를 만든다(§9.2) |
| 댓글, 회원, 뉴스레터 발송 | v1 이후 검토 |
| "Ask my blog"(벡터 검색), MCP 서버 | 보류. 글이 git에 있어 Claude가 파일을 직접 읽을 수 있다 |

### v1 이후 기능

- LinkedIn 공유 (Phase 4, §9.3)
- 한국어 ↔ 영어 번역 (Phase 2, §9.2)
- 커스텀 도메인 연결, 광고 슬롯과 CMP (Phase 6)
- "이 글에 질문하기" (Phase 6 선택, 기존 Go 백엔드 재사용)
- 사이트 내 검색, 포트폴리오 페이지 (Phase 4)

### 어떤 경우에도 하지 않는 것

- 사람 검수 없는 자동 번역 발행
- 사람 검수 없는 소셜 자동 게시

## 3. 아키텍처

```
src/content/posts/*.md (git)
   │  PR = 검수, merge = 발행
   ▼
Astro 빌드 (GitHub Actions)  ── 스키마 검증이 실패하면 빌드 실패
   ▼
정적 HTML/CSS (+ 최소 JS) ──→ GitHub Pages (https://jcheyoon.github.io, Phase 6에서 커스텀 도메인 연결)

(Phase 6, 선택) 글 페이지 질문 위젯(React 아일랜드) ──→ Go 백엔드 /api/posts/{slug}/ask
```

- 독자가 글을 볼 때 백엔드나 DB를 거치지 않는다.
- 사이트 저장소는 `JCheyoon.github.io`이다. 기존 Vite SPA는 `legacy/spa/`로 옮겨 보관한다(D7).
- `blog-backend`는 유지보수 모드로 둔다. 콘텐츠 원본이 아니다. DB에 글이 없어 옮길 콘텐츠도 없다(2026-11-23 작성자 확인). 질문 위젯을 붙이려면 글 본문을 DB 대신 사이트 기준으로 가져오도록 바꿔야 한다(Phase 6).

### 3.1 배포 방식과 브랜치

| 브랜치 | 역할 |
|---|---|
| `master` | 소스, 기본 브랜치 |
| `gh-pages` | 현재 배포본 (2025-12-17 골격). 전환 후에도 롤백용으로 보존한다 |
| 작업 브랜치 | `docs/*`, `migrate/astro`, `feat/*`, `publish/<slug>` 등. PR로 `master`에 merge한다 |

현재 Pages 설정(2026-11-23 GitHub API로 확인): 배포 방식 legacy, 소스 `gh-pages` 브랜치 `/`, 커스텀 도메인 없음, custom 404 없음.

전환 시점은 Phase 1 완료 시다. 전환 절차:

1. `migrate/astro`를 `master`에 merge하기 전에 Actions 배포 워크플로를 준비한다.
2. Settings → Pages → Source를 "GitHub Actions"로 바꾼다. 이 설정은 사람이 직접 한다.
3. 배포 결과를 확인한다.
4. 문제가 생기면 Source를 다시 `gh-pages` 브랜치로 되돌린다.

전환 전까지 지킬 것:
- `npm run deploy`(gh-pages 업로드)를 실행하지 않는다.
- `gh-pages` 브랜치는 삭제하지 않는다.
- Astro 버전은 설치 시점의 최신 안정 버전을 쓰고, 버전을 고정한다.

## 4. URL 규칙

| 경로 | 내용 | 비고 |
|---|---|---|
| `/` | 최신 글 목록 1페이지 | |
| `/page/[n]/` | 목록 n페이지 | n ≥ 2 |
| `/post/[slug]/` | 글 | 기존 `/post/:slug` 경로 구조 유지 |
| `/category/[slug]/` | 카테고리 글 목록 | 하위 카테고리 글 포함 |
| `/tag/[tag]/` | 태그 글 목록 | |
| `/archive/` | 연·월별 전체 목록 | |
| `/about/`, `/contact/`, `/privacy/`, `/terms/` | 고정 페이지 | |
| `/en/`, `/en/post/[slug]/` | 영어 글 목록, 영어 글 | Phase 2. 원문이든 번역본이든 영어 글은 여기 |
| `/rss.xml`, `/sitemap-index.xml`, `/robots.txt` | 빌드 시 자동 생성 | |
| 그 밖의 경로 | `404.html` | 실제 404 상태 |

slug 규칙:

- 영문 소문자, 숫자, 하이픈만 쓴다. frontmatter에 직접 쓰고 자동 생성하지 않는다.
- 발행 후에는 바꾸지 않는다. 꼭 바꿔야 하면 `src/data/redirects.ts`에 이전 주소와 새 주소를 추가하고, 이전 주소에 meta refresh와 canonical을 넣은 페이지를 생성한다.

기타:

- 끝 슬래시(D5): 페이지 주소는 모두 `/`로 끝난다(예: `/post/slug/`). 빌드는 디렉터리 방식(`post/slug/index.html`)으로 하고, canonical과 내부 링크도 끝 슬래시를 붙인다. 파일 주소(`/rss.xml` 등)는 예외다.
- 도메인 연결(Phase 6)은 모든 URL의 호스트가 바뀌는 변경이다. 그래서 다음을 지킨다.
  - canonical, sitemap, RSS, OG의 절대 URL은 전부 `SITE_URL` 하나에서 만든다. 하드코딩하지 않는다.
  - 도메인을 연결할 때 `jcheyoon.github.io` → 새 도메인 리다이렉트가 동작하는지 확인한다.
  - Search Console 주소 변경 절차를 확인한다(github.io 하위 도메인에서도 쓸 수 있는지 확인 필요).
- 기존 `/?category=이름` 주소는 리다이렉트하지 않는다. 배포본에 해당 기능이 없었기 때문이다(로컬 `origin/gh-pages` 기준).

## 5. 콘텐츠 모델

### 5.1 글: `src/content/posts/<slug>.md`

이미지는 `src/assets/posts/<slug>/`에 둔다.

| 필드 | 타입 | 필수 | 규칙 |
|---|---|---|---|
| title | string | 항상 | 본문과 일치, 과장 금지 |
| slug | string | 항상 | `^[a-z0-9]+(-[a-z0-9]+)*$`, 파일명과 같아야 함, 중복 금지 |
| description | string | 항상 | 검색 결과와 OG 요약. 본문 내용과 일치 |
| category | string | 항상 | `src/data/categories.ts`에 있는 slug |
| tags | string[] | 선택 | 소문자 |
| status | `draft` \| `reviewed` \| `published` | 항상 | |
| ai_assisted | boolean | 항상 | AI가 초안이나 문장 작성에 참여했으면 true |
| audience | string | 항상 | 대상 독자 |
| search_intent | string | 항상 | 검색 의도 한 문장 |
| created_at | date | 항상 | |
| reviewed_at | date | reviewed 이상 | |
| reviewed_by | string | reviewed 이상 | 검수한 사람 이름 |
| review_notes | string | reviewed 이상 | review-post 결과 요약 |
| published_at | date | published | 화면과 JSON-LD의 발행일 |
| updated_at | date | 선택 | 내용을 고친 날 |
| disclosure | string | 조건부 | 제휴·협찬이 있으면 필수 |
| sources | `{title, url, accessed}[]` | 선택 | 주요 출처 |
| cover | `{src, alt}` | 선택 | 쓰면 alt 필수 |
| lang | `ko` \| `en` | 선택 | 글의 언어. 기본 `ko`. 영어 글은 `src/content/posts/en/`에 둔다 (Phase 2) |
| translated_from | `ko` \| `en` | 번역본만 | 원문의 언어. 원문과 번역본은 같은 slug를 쓴다 (Phase 2) |

### 5.2 빌드 실패 조건 (스키마와 검사 스크립트)

- `status: published`인데 `reviewed_at`, `reviewed_by`, `published_at` 중 하나라도 없음
- reviewed 이상인 글 본문에 `[경험 추가 필요]` 또는 `[출처 확인 필요]`가 남아 있음
- 본문에 제휴 링크 도메인(`src/data/affiliate-domains.json`)이 있는데 `disclosure`가 비어 있음
- 목록에 없는 category, slug 형식 위반, slug 중복, alt 없는 이미지

### 5.3 단일 소스 파일

| 파일 | 내용 |
|---|---|
| `src/site.config.ts` | 사이트 이름, URL, 설명, 작성자, 소셜 링크. 작성자 이름 하드코딩 금지 |
| `src/data/categories.ts` | 카테고리 `{slug, name, parent?, description?}`. 초기값(2026-11-23 결정): `ai` AI 활용, `frontend` 프론트엔드, `backend` 백엔드, `etc` 기타 |
| `src/data/affiliate-domains.json` | 제휴 링크로 판정할 도메인 목록. 검사 스크립트(Node)가 그대로 읽을 수 있게 JSON으로 둔다 |

### 5.4 이미지

이미지는 서버에 올리지 않고 글과 같은 저장소에 넣는다. 그래서 별도의 업로드 엔드포인트가 필요 없다.

1. 파일을 `src/assets/posts/<slug>/`에 넣는다. 방법은 둘 중 하나다.
   - 로컬에서 폴더에 끌어다 놓는다.
   - GitHub 웹에서 Add file → Upload files로 올린다. 새 브랜치로 커밋하면 PR이 된다.
2. 본문에서 상대 경로로 참조한다: `![이미지 설명](../../assets/posts/<slug>/파일명.jpg)`
3. 빌드할 때 Astro가 webp로 변환하고, width·height를 넣고, lazy loading을 붙인다.

규칙:
- alt(이미지 설명)는 필수다. 이미지를 볼 수 없는 사람에게 무엇이 보이는지 설명한다.
- 외부 이미지 주소(https://...)는 쓰지 않는다. `check-content`가 잡는다.
- 올리기 전에 긴 변을 2000px 안팎으로 줄인다(권장값). 원본이 git에 쌓이므로 저장소 크기를 관리하기 위해서다.
- 대표 이미지(OG)는 frontmatter `cover: { src: ../../assets/posts/<slug>/cover.jpg, alt: ... }`로 지정한다. 없으면 사이트 기본 이미지를 쓴다.

### 5.5 공개 범위

- draft와 reviewed 글은 빌드 결과물, sitemap, RSS에 들어가지 않는다. 로컬 개발 서버에서만 보인다.

## 6. 페이지 요구사항

### 공통 레이아웃

- 헤더: 로고(홈 링크), 내비게이션
- 사이드바: 프로필과 카테고리. 768px 미만에서는 본문 아래로 내린다.
- 푸터: 저작권, 개인정보 처리방침·이용약관 링크
- 동작하지 않는 UI는 두지 않는다. 미구현 기능은 숨긴다.

### 페이지별 요구사항

| 페이지 | 요구사항 |
|---|---|
| 목록 (홈, `/page/n`, 카테고리, 태그) | 카드에 제목 링크(`<a href>`), 발행일, 카테고리, description. 페이지당 10개. 페이지네이션도 링크 |
| 글 | h1, 작성자, 발행일과 수정일, disclosure(있으면 제목 바로 아래), 본문(typography), 태그 링크, 이전/다음 글 |
| 아카이브 | 연·월로 묶은 전체 글 |
| 소개 | 운영자, 사이트 목적, 제작 방식(AI 보조와 사람 검수), 연락처 링크 |
| 문의 | 실제로 확인하는 이메일 주소. 폼은 v1 이후 |
| 개인정보 처리방침 | 수집 항목, 제3자 서비스, 시행일. 광고를 넣을 때 AdSense 필수 고지를 추가한다. 법령과 AdSense 요건은 작성 시점에 공식 문서로 확인한다 |
| 이용약관 | 저작권, 면책, 제휴 고지 |
| 404 | 안내 문구, 홈과 아카이브 링크 |

## 7. SEO 요구사항

- 색인 대상 페이지는 빌드 HTML에 다음이 모두 있어야 한다.
  - 본문 텍스트
  - 고유한 `<title>`, `meta description`
  - 절대 URL `canonical`
  - `og:title`, `og:description`, `og:url`, `og:type`, `og:image`
  - `<html lang="ko">`
- 글 페이지에는 JSON-LD `BlogPosting`(headline, datePublished, dateModified, author, image)과 `BreadcrumbList`를 넣는다.
- 목록 2페이지 이후는 canonical을 자기 자신으로 둔다.
- 내부 이동은 전부 `<a href>`로 한다.
- robots.txt에 sitemap 위치를 적는다.

## 8. 성능과 접근성

목표값은 외부 기준이 아니라 이 프로젝트가 스스로 정한 값이다.

- 독자 페이지의 기본 JS는 0이다. 허용하는 아일랜드는 다음 세 가지뿐이다.
  - 테마 토글 (Phase 3)
  - 사이트 내 검색 (Phase 4)
  - 질문 위젯 (Phase 6, 선택)
- 이미지는 Astro 이미지 처리로 크기를 지정하고 lazy loading을 쓴다. alt는 필수다.
- 광고 슬롯은 높이를 고정한 컨테이너로 미리 자리를 잡는다(Phase 6).
- 다크 모드는 `prefers-color-scheme`을 기본으로 하고, 사용자 선택을 저장하며, 첫 화면 깜빡임을 막는다.
- 목표: Lighthouse 모바일 Performance, SEO, Accessibility 각 90 이상.

## 9. 콘텐츠 파이프라인

| 단계 | 담당 | 도구 | 결과 |
|---|---|---|---|
| 초안 | AI | `draft-post` 스킬 | `status: draft`, 보완 필요 표시 |
| 보완 | 사람 | 에디터 | 경험, 사진, 출처 추가 |
| 검수 | AI가 점검표 작성, 사람이 판단 | `review-post` 스킬 | 사람이 "승인"하면 reviewed 기록 |
| 발행 | AI가 실행, 사람이 merge | `publish-post` 스킬 → PR | `published`, `published_at` |
| 배포 | CI | GitHub Actions | merge 시 자동 배포 |

- `master` 브랜치는 보호한다. 직접 push를 막고, PR merge는 사람만 한다. 이 설정은 사람이 GitHub에서 직접 한다.
- PR 템플릿에 검수 체크리스트 8항목을 넣는다.
- 발행 속도 상한은 주 3편이다.

### 9.2 번역 (Phase 2, 한국어 ↔ 영어)

원칙: 번역본 **생성은 자동**, **발행은 사람 검수 후**다. 작성자는 한국어나 영어 중 편한 언어로 원문을 쓴다.

- 대상 언어는 한국어(ko)와 영어(en) 둘뿐이다(D8). 원문이 한국어면 영어로, 영어면 한국어로 번역한다.
- 파일과 주소. 원문과 번역본은 같은 slug를 쓴다.
  | 언어 | 파일 | 주소 |
  |---|---|---|
  | 한국어 | `src/content/posts/<slug>.md` | `/post/<slug>/` |
  | 영어 | `src/content/posts/en/<slug>.md` | `/en/post/<slug>/` |
- frontmatter: 모든 글에 `lang`(기본 `ko`). 번역본에는 `translated_from`(원문 언어)과 `status: draft`, `ai_assisted: true`.
- 자동 생성: `publish-post`가 원문을 발행하면 이어서 `translate-post`를 실행해 반대 언어 번역 초안을 만든다.
  - 별도의 MCP 서버는 필요 없다. Claude Code 스킬이 저장소 파일을 직접 만든다.
  - 번역 초안은 발행 PR과 별도 브랜치(`translate/<slug>`)로 만들고, `create-pr` 절차(초안 확인 → 승인 → push)를 따른다.
- 번역본도 `review-post` → `publish-post`를 거친다. 검수는 두 언어를 읽을 수 있는 작성자가 한다. 번역본에서는 번역을 다시 만들지 않는다.
- 원문을 고치면 번역본을 재검수 대상으로 둔다. 원문 `updated_at`이 번역본 `reviewed_at`보다 나중이면 빌드 경고를 낸다.
- 원문과 번역본에 서로를 가리키는 `hreflang`을 넣고, sitemap에도 대체 언어를 넣는다. 언어 전환 링크는 번역본이 있는 글에만 표시한다.
- 브라우저 언어를 보고 자동으로 이동시키지 않는다. 전환은 링크로만 한다.
- 근거: Google 스팸 정책은 번역 같은 자동 변환으로 가치 없이 페이지를 대량 생성하는 것을 scaled content abuse로 본다([spam policies](https://developers.google.com/search/docs/essentials/spam-policies)). 그래서 생성은 자동으로 하되 발행 전 검수를 유지한다. 번역 페이지 표기는 [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions) 문서를 따른다.

### 9.3 LinkedIn 공유 (Phase 4)

원칙: 검수는 PR에서 사람이 하고, 게시만 자동으로 한다.

- `publish-post` 스킬이 발행 PR에 `social/linkedin/<slug>.md`(게시 문구 초안)를 함께 만든다.
- 사람이 PR에서 게시 문구를 검수하고 merge한다.
- merge되면 GitHub Action이 다음을 처리한다.
  1. 배포가 성공했는지, 글 URL이 200을 반환하는지 확인
  2. LinkedIn API로 게시
  3. 게시 결과(게시물 URL, 게시 시각)를 `social/linkedin/<slug>.md`에 기록하는 커밋
- 같은 글을 두 번 게시하지 않는다. 기록이 있으면 건너뛴다.
- 인증 방식:
  - LinkedIn 공식 API의 Share on LinkedIn 제품(`w_member_social` 권한)을 쓴다.
  - 액세스 토큰은 60일 만료다. 자동 갱신(refresh token)은 일부 파트너만 쓸 수 있다.
  - 따라서 토큰은 GitHub Secrets에 넣고, 만료 2주 전에 Action이 이슈로 알린다.
  - 근거: [Share on LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin), [OAuth 흐름](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow), [refresh token](https://learn.microsoft.com/en-us/linkedin/shared/authentication/programmatic-refresh-tokens)
- MCP 서버는 이 흐름에 필요하지 않다. Claude Desktop 등에서 블로그를 다루고 싶어지면 그때 다시 검토한다.

## 10. 배포

- 흐름: `master` merge → install → `astro check` → build → HTML 검사 스크립트 → Pages 배포
- HTML 검사 스크립트는 다음을 확인한다.
  - dist의 모든 글 HTML에 title, description, canonical, h1, 본문이 있는지
  - draft와 reviewed 글이 dist에 없는지
  - `404.html`이 있는지
- 환경 변수: `SITE_URL`. Phase 6 전까지는 `https://jcheyoon.github.io`. 백엔드 URL은 Phase 6에서 추가한다.

## 11. 열린 결정

| # | 항목 | 결정 / 권장 | 상태 |
|---|---|---|---|
| D1 | 콘텐츠 원본 | git Markdown | 승인 (2026-11-23) |
| D2 | 프레임워크 | B Astro | 승인 (2026-11-23) |
| D3 | 커스텀 도메인 | 보유 중인 도메인을 Phase 6에서 연결. 주소는 그때 받는다 | 승인 (2026-11-23) |
| D4 | 호스팅 | 우선 GitHub Pages, 광고 도입 전(Phase 6) 재검토(GitHub Pages 상업 이용 제한 문구 때문) | 대기 |
| D5 | 끝 슬래시 | `/post/slug/` (디렉터리 방식, 끝 슬래시 있음) | 승인 (2026-11-23) |
| D6 | 관리자 SPA | 은퇴. 번역과 LinkedIn은 git 파이프라인에서 처리(§9.2, §9.3) | 승인 (2026-11-23) |
| D7 | legacy 보관 위치 | `legacy/spa/` | 승인 (2026-11-23) |
| D8 | 번역 | 한국어 ↔ 영어 양방향. 원문을 발행하면 반대 언어 번역 초안을 자동 생성하고, 검수 후 발행 | 승인 (2026-11-23, 2026-11-24 양방향·자동 생성으로 변경) |

## 12. 완료 정의 (모든 기능 공통)

- SPEC의 해당 요구사항을 충족한다.
- `astro check`, build, HTML 검사가 통과한다.
- 375px 모바일과 데스크톱 화면에서 확인했다.
- 동작하지 않는 UI가 없다.
- 결정이 바뀌었으면 SPEC, ROADMAP, rules를 같은 PR에서 고친다.
