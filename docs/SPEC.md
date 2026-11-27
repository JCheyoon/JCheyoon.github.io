# 블로그 사양서 (SPEC)

- 상태: 승인된 초안 (2026-11-23, 2026-11-24 번역 방식·단계 순서 변경, 2026-11-25 MCP 서버·영어 사이트 구조·Phase 3 세부). D1~D3, D5~D18 결정. D4는 Phase 6에서 논의.
- 관련 문서: `docs/ROADMAP.md`, `.claude/rules/`
- 표시: [결정 필요]는 §11 열린 결정 표에 있는 항목

## 1. 목적

- 개발하면서 직접 겪은 문제와 해결을 기록하는 1인 기술 블로그.
- 검색 유입을 받고, 장기적으로 광고, 제휴, 자체 디지털 상품으로 수익을 낸다.
- AI가 초안을 돕고 사람이 검수해서 발행한다. 글 수보다 품질을 우선한다.
- MCP 활용 기술 블로그다. 블로그 운영(초안, 검사, 번역, 발행 준비)을 직접 만든 MCP 서버로 하고(§9.4), 그 과정을 글로 쓴다.

## 2. 범위

### v1에 포함

- 공개 페이지: 홈, 글, 카테고리, 태그, 아카이브, 소개, 문의, 개인정보 처리방침, 이용약관, 404
- SEO 기본: 페이지별 메타, sitemap, RSS, robots.txt, 구조화 데이터
- 콘텐츠 파이프라인: draft → reviewed → published, 빌드 시 검증
- GitHub Actions 정적 배포

### v1에서 제외

| 기능 | 이유 |
|---|---|
| 관리자 웹 에디터 | git과 PR이 작성·검수 도구를 대신한다. 기존 코드는 2026-11-26 삭제(git 기록 `19ddd8b`) |
| 다국어 페이지 | Phase 2에서 한국어 ↔ 영어 번역 구조를 만든다(§9.2) |
| 댓글 | Giscus(D17). Phase 5, 첫 글 발행 뒤 붙인다 |
| 회원, 뉴스레터 발송 | v1 이후 검토 |
| "Ask my blog"(벡터 검색) | 보류. 글이 git에 있어 Claude가 파일을 직접 읽을 수 있다 |

### v1 이후 기능

- LinkedIn 공유 (Phase 4, §9.3)
- 한국어 ↔ 영어 번역 (Phase 2a, §9.2)
- 블로그 MCP 서버 (Phase 2b, §9.4)
- 댓글 (Phase 5, Giscus, D17)
- 커스텀 도메인 연결, 광고 슬롯과 CMP (Phase 6)
- 공개 읽기 전용 MCP 서버 (Phase 5와 함께, D18). 독자가 자기 AI 앱에 연결해 글을 검색·요약한다
- 사이트 내 검색 (Phase 3으로 당김, §6.3)

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

빌드 ──→ 공개 글 데이터 /data/posts.json (공개 글만) ◀── blog-backend 공개 MCP 서버 /mcp (D18) ◀── 독자의 AI 앱(커넥터)

작성자 ── MCP 클라이언트(Claude Code 등) ── 블로그 MCP 서버(mcp/, 로컬 stdio) ──→ 저장소 파일·검사
```

- 독자가 글을 볼 때 백엔드나 DB를 거치지 않는다.
- 사이트 저장소는 `JCheyoon.github.io`이다. 기존 Vite SPA는 `legacy/spa/`에 보관했다가 2026-11-26에 삭제했다(D7, git 기록 `19ddd8b`).
- `blog-backend`는 공개 읽기 전용 MCP 서버를 위해 유지한다(D18). 작성자가 연습을 겸해 Go로 직접 만든다. DB는 쓰지 않고, 사이트 빌드가 공개하는 글 데이터 파일을 읽는다. DB(Supabase)·REST API·질문하기·관리자 API는 2026-11-26 정리 브랜치(`chore/slim-backend`)에서 지웠다. 그 PR이 merge되어야 배포된 서버에서도 사라진다.
- 블로그 MCP 서버는 독자에게 보이지 않는 작성자용 도구다. 사이트 저장소의 `mcp/`에 둔다(D10, §9.4).

### 3.1 배포 방식과 브랜치

| 브랜치 | 역할 |
|---|---|
| `master` | 소스, 기본 브랜치 |
| 작업 브랜치 | `docs/*`, `migrate/astro`, `feat/*`, `publish/<slug>` 등. PR로 `master`에 merge한다 |

현재 Pages 설정(2026-11-25 GitHub API로 확인): 배포 방식 GitHub Actions(`site.yml`), 커스텀 도메인 없음. `master`에 merge하면 자동 배포된다.

- 롤백: 문제가 된 merge를 되돌리는 PR을 merge한다. 급하면 Actions에서 이전에 성공한 `master` 배포 실행을 다시 실행(Re-run)한다. 그 실행의 커밋으로 다시 빌드·배포된다. Re-run은 GitHub가 정한 기간 안의 실행에만 쓸 수 있으므로(기간은 GitHub 문서로 확인), 오래된 실행이면 되돌리는 PR을 쓴다.
- Astro 버전은 설치 시점의 최신 안정 버전을 쓰고, 버전을 고정한다.

## 4. URL 규칙

| 경로 | 내용 | 비고 |
|---|---|---|
| `/` | 최신 글 목록 1페이지 | |
| `/page/[n]/` | 목록 n페이지 | n ≥ 2 |
| `/post/[slug]/` | 글 | 기존 `/post/:slug` 경로 구조 유지 |
| `/category/[slug]/`, `/category/[slug]/page/[n]/` | 카테고리 글 목록 | 하위 카테고리 글 포함. 홈처럼 페이지당 5개(2026-11-25) |
| `/tag/[tag]/`, `/tag/[tag]/page/[n]/` (+`/en/`) | 태그 글 목록 | Phase 3. 글이 있는 태그만 만든다. 페이지당 5개 |
| `/archive/`, `/en/archive/` | 연도별 전체 목록(날짜는 월·일) | Phase 3 |
| `/about/`, `/contact/`, `/privacy/`, `/terms/` (+`/en/`) | 고정 페이지 | 문의·처리방침·약관은 Phase 4. 영어판은 번역이고, 내용이 다르면 한국어판이 기준 |
| `/en/`, `/en/page/[n]/` | 영어 글 목록 | Phase 2a. 영어 사이트는 한국어 사이트와 같은 구조이고 영어 글만 보인다(D11) |
| `/en/post/[slug]/` | 영어 글 | 원문이든 번역본이든 영어 글은 여기 |
| `/en/category/[slug]/` | 영어 카테고리 글 목록 | |
| `/en/about/` | 영어 소개 | |
| `/en/rss.xml` | 영어 글 RSS | `/rss.xml`은 한국어 글만 |
| `/rss.xml`, `/sitemap-index.xml`, `/robots.txt` | 빌드 시 자동 생성 | |
| `/og/<slug>.png`, `/og/en/<slug>.png` | 글 OG 이미지 | cover가 없는 글만(D12) |
| `/pagefind/` | 검색 색인 | 공개 글이 있을 때만(D16) |
| `/data/posts.json` | 공개 글 데이터(한국어·영어, 본문 Markdown 포함) | 공개 MCP 서버가 읽는다(D18). 형식은 D18 |
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
- 기존 `/?category=이름` 주소는 리다이렉트하지 않는다. 이전 사이트에 해당 기능이 없었기 때문이다.

## 5. 콘텐츠 모델

### 5.1 글: `src/content/posts/<slug>.md`

이미지는 `src/assets/posts/<slug>/`에 둔다.

| 필드 | 타입 | 필수 | 규칙 |
|---|---|---|---|
| title | string | 항상 | 본문과 일치, 과장 금지 |
| slug | string | 항상 | `^[a-z0-9]+(-[a-z0-9]+)*$`, 파일명과 같아야 함, 중복 금지 |
| description | string | 항상 | 검색 결과와 OG 요약. 본문 내용과 일치 |
| category | string | 항상 | `src/data/categories.ts`에 있는 slug |
| tags | string[] | 선택 | 영문 소문자, 숫자, 하이픈(`/tag/<tag>/` 주소가 된다. D13) |
| status | `draft` \| `reviewed` \| `published` | 항상 | |
| ai_assisted | boolean | 항상 | AI 초안은 true로 시작한다. 원문은 작성자가 직접 고쳐 쓰고 검수했으면 검수 때 false로 바꿀 수 있다. 번역본은 항상 true이고, 글 제목 아래에 "AI의 도움으로 번역했고 작성자가 검수했다"는 안내와 원문 링크가 보인다(2026-11-27 작성자 결정) |
| audience | string | 항상 | 대상 독자 |
| search_intent | string | 항상 | 검색 의도 한 문장 |
| created_at | date | 항상 | |
| reviewed_at | date | reviewed 이상 | |
| reviewed_by | string | reviewed 이상 | 검수한 사람 이름 |
| review_notes | string | reviewed 이상 | review-post 결과 요약 |
| published_at | date | published | 화면과 JSON-LD의 발행일 |
| updated_at | date | 선택 | 내용을 고친 날 |
| disclosure | string | 조건부 | 제휴·협찬이 있으면 필수 |
| linkedin | boolean | 선택 | `true`면 발행 후 LinkedIn에 올린다. 영어 글만 (§9.3) |
| linkedin_text | string | 선택 | LinkedIn 게시 문구. 없으면 제목과 description (§9.3) |
| sources | `{title, url, accessed}[]` | 선택 | 주요 출처 |
| cover | `{src, alt}` | 선택 | 쓰면 alt 필수 |
| lang | `ko` \| `en` | 선택 | 글의 언어. 기본 `ko`. 영어 글은 `src/content/posts/en/`에 둔다 (Phase 2) |
| translated_from | `ko` \| `en` | 번역본만 | 원문의 언어. 원문과 번역본은 같은 slug를 쓴다 (Phase 2) |

날짜 필드(`*_at`, `accessed`)는 작성자가 적은 **달력의 날짜**다(2026-11-26 작성자 결정). 새로 적을 때는 작성하는 컴퓨터 시간대의 오늘을 쓴다. 작성자가 어디에 있든 코드를 바꾸지 않는다. 사이트는 적힌 날짜를 시간대 변환 없이 그대로 보여 주고, 화면에 시간대를 표시하지 않는다.

### 5.2 빌드 실패 조건 (스키마와 검사 스크립트)

- `status: published`인데 `reviewed_at`, `reviewed_by`, `published_at` 중 하나라도 없음
- reviewed 이상인 글 본문에 `[경험 추가 필요]` 또는 `[출처 확인 필요]`가 남아 있음
- 본문에 제휴 링크 도메인(`src/data/affiliate-domains.json`)이 있는데 `disclosure`가 비어 있음
- 목록에 없는 category, slug 형식 위반, slug 중복, alt 없는 이미지

### 5.3 단일 소스 파일

| 파일 | 내용 |
|---|---|
| `src/site.config.ts` | 사이트 이름, URL, 설명, 작성자, 소셜 링크. 작성자 이름 하드코딩 금지 |
| `src/data/categories.ts` | 카테고리 `{slug, name, parent?, description?}`. 초기값(2026-11-23 결정): `ai` AI 활용, `frontend` 프론트엔드, `backend` 백엔드, `cs` 컴퓨터 과학, `etc` 기타. 하위 카테고리는 두지 않고 세부 분류는 태그로 한다 |
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
- 대표 이미지(`cover`)는 선택이다(2026-11-27 작성자 결정). 내용을 설명하는 이미지(구조 그림, 실행 화면, 비교, 측정 그래프)가 있을 때만 넣고, 장식용 이미지는 넣지 않는다. 넣으면 글 제목 아래와 목록 카드에 보이고 공유 이미지로도 쓰이므로 1200×630 비율로 만든다. 휴대폰 목록에서는 위아래가 조금 잘리므로 중요한 글자와 그림은 가운데에 둔다. 글 템플릿의 안내와 `draft-post`가 이 기준을 따른다.
- 대표 이미지(OG)는 frontmatter `cover: { src: ../../assets/posts/<slug>/cover.jpg, alt: ... }`로 지정한다. 없으면 빌드가 제목·카테고리·글쓴이·날짜를 넣은 1200×630 이미지를 글마다 만든다(D12, Phase 3, 2026-11-25 작성자 확인). 주소는 `/og/<slug>.png`, 영어 글은 `/og/en/<slug>.png`.

### 5.5 공개 범위

- draft와 reviewed 글은 빌드 결과물, sitemap, RSS에 들어가지 않는다. 로컬 개발 서버에서만 보인다.

### 5.6 본문 작성 문법 (Phase 3)

기본 Markdown에 더해 다음을 쓸 수 있다(§6.1).

- 안내 상자: GitHub 문법 `> [!NOTE]`(NOTE, TIP, IMPORTANT, WARNING, CAUTION). 같은 줄에 제목을 쓸 수 있다: `> [!TIP] 빌드 시간 줄이기`. 제목이 없으면 종류 이름(참고, 팁, 중요, 주의, 위험)을 쓴다.
- 바깥 링크는 Markdown 문법(`[이름](주소)`)으로 쓴다. 새 탭 설정이 자동으로 붙는다. 본문에 HTML `<a>`를 직접 쓰면 자동 설정이 붙지 않으므로 `target="_blank" rel="noopener"`를 함께 써야 한다(빠지면 `check-html`이 실패한다. 2026-11-27 재현).
- 코드 블록: 언어 뒤에 `title="파일명"`, 줄 강조 `{2-3}`, 추가·삭제 `ins={4} del={5}`, 접기 `collapse={1-5}`. 셸 세션은 `shellsession` 언어로 쓰면 줄 번호를 숨긴다.

### 5.7 글 템플릿 (Phase 2b)

초안을 만들 때 고르는 본문 구조다. `src/content/templates/`에 두고, 각 파일 머리에 언제 쓰는지 적는다.
템플릿은 선택이다. 맞는 것이 없으면 자유 형식으로 쓴다. frontmatter에 글 유형 필드는 두지 않는다.

| 템플릿 | 쓰는 경우 | 섹션 |
|---|---|---|
| `measurement` 측정·검증 | 직접 측정한 수치와 비교가 핵심 | 목적 → 환경 → 측정 방법 → 결과(수치 표) → 해석 → 한계 → 재현 방법 |
| `devlog` 개발 기록 | 무엇을 어떤 과정으로 만들었는지 | 배경 → 목표 → 과정 → 막힌 점 → 결정과 이유 → 결과 → 회고 |
| `summary` 자료 정리 | 여러 자료를 읽고 이해한 것을 정리 | 답하는 질문 → 참고 자료와 필요했던 부분 → 이해한 내용 → 결론 → 더 볼 것 |
| `implementation` 구현 과정 | 구현하며 찾아본 자료, 의구심, 판단 | 요구사항 → 찾아본 자료 → 의구심 → 구현 → 검증 → 남은 문제 |
| 선택 블록 `troubleshooting` | 장애·성능 문제를 해결한 경우 | 증상과 영향 → 타임라인 → 추정 → 소거 → 확신 → 검증 → 원인 → 조치 → 재발 방지 |
| 선택 블록 `bugfix` | 버그를 해결한 경우 | 재현 조건 → 기대와 실제 → 원인 → 수정 → 테스트·커버리지 → 재발 방지 |

- 작성자 경험이 필요한 자리에는 `[경험 추가 필요: …]` 표시를 넣는다. 남아 있으면 검수·발행할 수 없다(§5.2).
- 트러블슈팅은 회사가 허용하는 범위로, 필요하면 추상화해서 쓴다.
- 제목은 본문과 일치해야 하고 과장하지 않는다(§5.1). 2026-11-25 작성자 확인.
- `draft-post`는 주제와 메모를 보고 템플릿과 선택 블록을 이유와 함께 제안하고, 작성자 확인 후 초안을 만든다.

## 6. 페이지 요구사항

### 공통 레이아웃

- 헤더: 막대 없는 헤더(흰 배경·테두리 없음, 2026-11-25 작성자 확인). 로고는 사이드바 왼쪽 선, 오른쪽 둥근 아이콘 버튼(검색·언어·테마)은 본문 오른쪽 선에 맞춘다. 가운데 메뉴는 반투명 둥근 묶음(알약) 안에 두고, 현재 메뉴는 안쪽 옅은 청록 알약으로 칠한다. 카테고리·태그 목록에서도 "홈"이 현재 메뉴다(홈 목록을 거른 화면). 아카이브 메뉴 이름은 "기록". 맨 위에서는 투명하고 조금 내리면 흐림 배경. 768px 미만은 §6.2
- 사이드바: 프로필, 카테고리(전체 글 + 6개, 나머지는 "더보기"), 태그(고른 태그를 다시 누르면 해제). 768px 미만에서는 숨기고 목록 위 필터 버튼(카테고리·태그 시트)으로 대신한다(§6.2).
- 푸터: 문의·개인정보 처리방침·이용약관 링크(지금 언어의 페이지로), 저작권. 문의는 헤더 메뉴에 두지 않는다(2026-11-25 작성자 결정). 1536px 미만에서는 화면 아래에 뜨는 목차·맨 위로 버튼이 가리지 않게 아래 여백을 80px로 둔다(2026-11-26 작성자 결정. `sticky`로 멈추는 방식은 넓은 화면에서의 위치와 키보드 순서 문제로 쓰지 않는다)
- Google Search Console: URL 접두어 속성 `https://jcheyoon.github.io/`를 HTML 태그로 확인한다. 값은 `site.config.ts`의 `googleSiteVerification`이고 홈 `<head>`에 넣는다. 확인 뒤에도 지우지 않는다
- 네이버 서치어드바이저: `https://jcheyoon.github.io`를 HTML 태그로 확인한다. 값은 `site.config.ts`의 `naverSiteVerification`이고 홈 `<head>`에 넣는다. 확인 뒤에도 지우지 않는다(2026-11-27 작성자 결정)
- 동작하지 않는 UI는 두지 않는다. 미구현 기능은 숨긴다.

### 페이지별 요구사항

| 페이지 | 요구사항 |
|---|---|
| 목록 (홈, `/page/n`, 카테고리, 태그) | 카드에 제목 링크(`<a href>`), 발행일, 카테고리, description. `cover`가 있는 글은 이미지를 보인다. 640px 이상은 오른쪽 썸네일(1024px 이상 192×101, 미만 128×67. 사이드바가 있는 좁은 화면에서 제목 칸을 확보한다), 640px 미만은 카드 맨 위 전체 폭에 2.4:1(360px 화면에서 높이 136px. 폭이 달라도 위아래가 같은 비율로 조금 잘린다). 이미지를 눌러도 글로 가며, 키보드와 화면 낭독기에는 제목 링크 하나만 남긴다. 없으면 빈 자리 없이 글을 넓게 쓴다. 썸네일은 장식(`alt=""`, `aria-hidden`)이고 첫 카드만 바로 불러온다(2026-11-26 작성자 결정). 목록(홈·n페이지)은 페이지당 5개(2026-11-25 작성자 결정). 페이지네이션도 링크 |
| 글 | h1, 작성자, 발행일과 수정일, disclosure(있으면 제목 바로 아래), 본문(§6.1), 태그 링크, 이전/다음 글 |
| 아카이브 | 연도별로 묶은 전체 글(날짜는 월·일). 연도는 제목(h2) |
| 소개 | 운영자, 사이트 목적, 제작 방식(AI 보조와 사람 검수). 연락처는 두지 않는다. 문의는 푸터의 문의 페이지, GitHub는 사이드바에 있고 768px 미만(사이드바 숨김)에서는 푸터에 보인다(2026-11-27 작성자 결정) |
| 문의 | 실제로 확인하는 이메일 주소(`site.config.ts`의 `email`). 폼은 v1 이후 |
| 개인정보 처리방침 | 수집 항목, 제3자 서비스, 시행일. 광고를 넣을 때 AdSense 필수 고지를 추가한다. 법령과 AdSense 요건은 작성 시점에 공식 문서로 확인한다 |
| 이용약관 | 저작권, 면책, 제휴 고지 |
| 404 | 안내 문구, 홈과 아카이브 링크 |

### 6.1 본문 디자인 (Phase 3, D9)

| 요소 | 모양 | 처리 위치 |
|---|---|---|
| 제목 앵커 | h2~h4에 마우스를 올리면 `#` 링크 표시. 마우스가 없는 화면(`hover: none`)에서는 숨긴다(2026-11-26 작성자 결정) | 빌드(hast 플러그인) |
| 표 | 칸은 단어 중간에서 끊지 않는다. 칸 안의 긴 코드와 링크는 예외로 끊어 화면을 넘지 않게 한다 | CSS |
| 링크 | 강조색, 점선 밑줄, 마우스를 올리면 배경. 사이트 어디에 있든 바깥 사이트 링크는 새 탭으로 열고, 블로그 안의 링크는 같은 탭이다(2026-11-27 작성자 결정, `check-html`이 검사) | CSS, `src/lib/markdown.ts` |
| 인라인 코드 | 배경색 칩, 앞뒤 백틱 표시 없음 | CSS |
| 코드 블록 | 둥근 프레임, 파일명·터미널 창, 줄 번호, 언어 표시, 복사 버튼, 추가·삭제·강조 줄, 접기 | 빌드(Expressive Code), 복사 버튼만 JS |
| 목록 기호 | 강조색 | CSS |
| 인용문 | 기울임·따옴표 없음, 왼쪽 둥근 세로 막대 | CSS |
| 안내 상자 | note, tip, important, warning, caution | 빌드(mdast 플러그인) |
| 이미지·구분선 | 이미지 모서리 둥글게, 구분선은 점선 | CSS |
| 글 카드 | 제목·메타·본문을 흰 카드 하나에 담는다. 제목 왼쪽 강조 막대 | 레이아웃 |
| 메타 줄 | 발행일, 수정일, 카테고리, 작성자. 항목마다 아이콘 상자 | 레이아웃 |
| 이전·다음 글 | 카드 밖 두 개의 버튼(화살표 + 제목) | 레이아웃 |
| 목차 | h2(번호)·h3. 본문 오른쪽 기둥 위쪽, 본문 윗선에서 시작해 따라온다. 화면에 보이는 구간을 점선 상자로 표시. 1536px 미만 화면에서는 숨긴다 | 빌드 + JS(표시만) |
| 맨 위로 버튼 | 본문 오른쪽 기둥 아래. 스크롤 중엔 화면 아래에 붙고, 끝에서는 본문 아랫선(이전·다음 글 버튼)에 맞춰 멈춘다. 본문 옆 여백이 좁으면 화면 오른쪽 아래. 조금 내려오면 나타난다 | `#top` 링크 + JS(표시만) |

넣지 않는 것: GitHub 저장소 카드(브라우저에서 API를 불러와 본문을 그리므로 §8의 "기본 JS 0"과 렌더링 규칙에 맞지 않음), 스포일러, 수식(KaTeX).

다크 모드에서도 본문 대비가 Lighthouse Accessibility 기준을 통과해야 한다.

### 6.2 모바일 UI (Phase 3 마지막, D15)

768px 미만 화면에서 앱처럼 쓰는 구성. 시안: 2026-11-25 작성자 확인.

| 요소 | 모양 | 처리 |
|---|---|---|
| 하단 탭 바 | 홈 · 기록 · 검색 · 소개. 현재 탭은 강조색 | 링크. 검색 탭은 검색 창을 연다(스크립트가 없으면 숨긴다) |
| 목록 필터 | 목록 페이지(홈, n페이지, 카테고리, 태그) 위 두 버튼 `[📁 카테고리 ▾] [# 태그 ▾]`. 버튼 이름에 지금 고른 것을 보이고, 누르면 각각 바텀 시트(카테고리는 세로 목록과 글 수, 태그는 태그와 글 수, 줄마다 44px). 고른 태그는 "선택 해제"나 다시 눌러 해제. 사이드바는 모바일에서 숨긴다. 스크립트가 없으면 카테고리 링크 줄을 대신 보인다 | 링크 + 공통 바텀 시트(`BottomSheet.astro`) |
| 헤더 | 48px. 왼쪽 로고(글 페이지는 카테고리 목록으로 가는 뒤로 ‹), 오른쪽 언어·테마. 메뉴는 하단 탭 바로 | 링크 |
| 글 목차 바텀 시트 | 왼쪽 아래 "목차" 버튼(오른쪽 아래는 맨 위로 버튼) → 아래에서 올라오는 시트. 오른쪽 목차가 숨는 1536px 미만에서 쓴다 | 브라우저 `<dialog>` + 짧은 스크립트(열기·닫기). 스크립트가 없으면 버튼을 숨긴다 |
| 숨는 헤더 | 아래로 스크롤하면 숨고, 위로 올리면 나타난다 | 짧은 스크립트 |
| 페이지 전환 | 페이지 이동을 부드럽게 | 브라우저 View Transitions(CSS) |

맨 위로 버튼은 하단 탭 바 위로 올린다. 바텀 시트와 숨는 헤더 스크립트는 §8 허용 스크립트에 넣는다.

### 6.3 검색 (Phase 3, D16. 2026-11-25 Phase 4에서 당김)

| 화면 | 모양 |
|---|---|
| 데스크톱 | 헤더 오른쪽 검색 버튼(⌘K/Ctrl+K 표시). 누르면 지금 페이지 위에 검색 창. 결과마다 본문에서 일치한 부분 강조, ↑↓·Enter·Esc |
| 모바일 | 하단 탭의 검색 → 화면 전체가 검색 창 |

- 구현은 Pagefind. 빌드 뒤 글 페이지(`/post/`, `/en/post/`)만 언어별로 색인하고(`scripts/build-search.mjs`), 검색 창을 열 때만 스크립트와 색인을 불러온다. 지금 보는 언어의 글만 찾는다.
- 색인에는 글 제목과 본문만 넣는다(이동 경로·메타는 `data-pagefind-ignore`). 공개 글이 없으면 색인을 건너뛰고, 검색 창은 "지금은 검색을 쓸 수 없습니다"를 보인다.
- 개발 서버(`npm run dev`)에는 색인이 없다. 확인은 `npm run build:drafts` 뒤 `INCLUDE_DRAFTS=true npx astro preview`로 한다.
- 스크립트가 없으면 검색 버튼을 숨긴다.

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

- 독자 페이지의 기본 JS는 0이다. 허용하는 스크립트는 다음뿐이다.
  - 테마 토글 (Phase 3)
  - 코드 블록 복사 버튼 (Phase 3, Expressive Code 내장 스크립트, §6.1)
  - 목차의 현재 위치 강조, 맨 위로 버튼 표시 (Phase 3, §6.1). 둘 다 스크립트가 없어도 링크로 동작한다
  - 테마 토글(D14), 목차 바텀 시트 열기·닫기, 숨는 헤더 (Phase 3, §6.2). 스크립트가 없으면 토글·시트 버튼은 숨기고 헤더는 그대로 둔다
  - 사이트 내 검색 (Phase 3, §6.3). 창을 열 때만 불러온다
  - 댓글(giscus, D17): 발행한 글 페이지에서만 쓴다. `giscus.app/client.js`는 댓글 영역이 가까워질 때(화면 아래 600px) 불러온다. 그전에는 giscus에 접속하지 않는다. 불러오지 못하면 댓글 영역을 숨긴다. 테마 버튼과 연동한다. 스크립트가 없으면 댓글 영역을 숨긴다
  - 방문 통계 스크립트: 보류(2026-11-27 작성자 결정). Search Console 실적 보고서로 대체하고, 필요하면 Phase 6에서 다시 검토한다
- 이미지는 Astro 이미지 처리로 크기를 지정하고 lazy loading을 쓴다. alt는 필수다.
- 광고 슬롯은 높이를 고정한 컨테이너로 미리 자리를 잡는다(Phase 6).
- 다크 모드는 `prefers-color-scheme`을 기본으로 하고, 사용자 선택을 저장하며, 첫 화면 깜빡임을 막는다. 토글은 라이트/다크 2단계다(D14).
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

### 9.2 번역 (Phase 2a, 한국어 ↔ 영어)

원칙: 번역본 **생성은 자동**, **발행은 사람 검수 후**다. 작성자는 한국어나 영어 중 편한 언어로 원문을 쓴다.

- 대상 언어는 한국어(ko)와 영어(en) 둘뿐이다(D8). 원문이 한국어면 영어로, 영어면 한국어로 번역한다.
- 파일과 주소. 원문과 번역본은 같은 slug를 쓴다.
  | 언어 | 파일 | 주소 |
  |---|---|---|
  | 한국어 | `src/content/posts/<slug>.md` | `/post/<slug>/` |
  | 영어 | `src/content/posts/en/<slug>.md` | `/en/post/<slug>/` |
- frontmatter: 모든 글에 `lang`(기본 `ko`). 번역본에는 `translated_from`(원문 언어)과 `status: draft`, `ai_assisted: true`.
- 자동 생성: `publish-post`로 원문을 발행할 때 블로그 MCP 서버의 `translate_post` 도구로 반대 언어 번역 초안을 만든다(§9.4). 번역문은 MCP 클라이언트의 모델이 쓰고, 도구는 형식 검사와 파일 저장을 한다.
  - 영어 번역 문체(2026-11-27 작성자 결정). `translate_post` 도구 설명에 담는다. 도구가 코드로 검사하지는 못하므로 검수에서 확인한다.
    - CEFR B2 이하의 읽기 쉬운 미국식 영어. 개발자가 쓰는 기술 용어는 예외이며 쉬운 말로 바꾸지 않는다.
    - 한국어에만 통하는 표현은 직역하지 않고 뜻이 같은 영어 표현으로 바꾼다.
    - 원문의 인칭을 유지하고 개인적이고 편한 말투를 살린다.
    - 확신의 정도를 유지한다. 추측을 단정으로, 의견을 사실로 바꾸지 않는다.
    - 제목과 description은 영어 검색어에 맞게 자연스럽게 쓴다. 뜻과 주장은 바꾸지 않는다.
    - 과장되거나 AI 특유의 표현(delve, game-changer, seamless 등)을 쓰지 않는다.
    - 한국 독자만 아는 이름이나 맥락은 처음 나올 때 짧게 설명한다. 원문에 없는 내용은 이 설명만 더할 수 있다.
    - 한국어의 문장 구조를 따라가지 않고 처음부터 영어로 쓴 것처럼 옮긴다. 맞는 관용 표현이 없으면 평범한 말로 쓴다. 저장하기 전에 영어 글만 따로 읽으며 번역 투를 고친다.
    - 검수를 마친 글에 남은 표현은 `docs/translation-glossary.md`에 모으고, 번역하기 전에 읽는다. 번역 승인 뒤 최종 번역문과 대조해 고친다.
    - 번역 뒤에는 뜻으로 옮긴 표현과 더한 설명을 원문과 나란히 목록으로 작성자에게 알린다. 표현집에 없는 표현은 후보 2~3개를 보여 주고, 작성자가 고른 것을 표현집에 기록한다.
- **원문과 번역본은 함께 발행한다**(2026-11-27 작성자 결정). 같은 브랜치(`publish/<slug>`)에서 번역 초안을 만들고, 작성자가 번역본을 검수해 승인하면 두 글을 `published`로 바꿔 PR 하나로 낸다. 작성자가 원하면 번역 없이 원문만 발행할 수 있다.
- 번역본도 `review-post` 점검과 작성자 승인을 거친다. 검수는 두 언어를 읽을 수 있는 작성자가 한다. 번역본에서는 번역을 다시 만들지 않는다.
- 원문을 고치면 번역본을 재검수 대상으로 둔다. 원문 `updated_at`이 번역본 `reviewed_at`보다 나중이면 빌드 경고를 낸다.
- 원문과 번역본에 서로를 가리키는 `hreflang`을 넣고, sitemap에도 대체 언어를 넣는다.
- 언어 전환 링크(헤더 오른쪽): 글은 번역본이 있을 때만 짝 글로 연결한다. 목록, 카테고리, 소개는 항상 다른 언어의 같은 페이지로 연결한다.
- 한국어 페이지를 새로 만들면 영어판도 `/en/` 아래 같은 경로로 만든다(D11).
- 브라우저 언어를 보고 자동으로 이동시키지 않는다. 전환은 링크로만 한다.
- 근거: Google 스팸 정책은 번역 같은 자동 변환으로 가치 없이 페이지를 대량 생성하는 것을 scaled content abuse로 본다([spam policies](https://developers.google.com/search/docs/essentials/spam-policies)). 그래서 생성은 자동으로 하되 발행 전 검수를 유지한다. 번역 페이지 표기는 [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions) 문서를 따른다.

### 9.3 LinkedIn 공유 (Phase 4)

원칙: 올릴 글은 글마다 작성자가 고르고, 게시만 자동으로 한다. LinkedIn에는 **영어 글만** 올린다(2026-11-26 작성자 결정).

- 고르기: 영어 글 frontmatter에 `linkedin: true`를 적는다. 없거나 `false`면 올리지 않는다. `publish-post`는 영어 글에 `linkedin` 값이 없을 때만 `linkedin: false`를 적어 두고, 이미 있는 값은 바꾸지 않으며 묻지 않는다. 올리려면 작성자가 `true`로 바꾼다(2026-11-27 작성자 결정). 한국어 글에 적으면 검사가 실패한다. 번역 도구는 이 값을 넣지 않는다.
- 문구: 기본은 제목, description, 글 주소다. 다르게 쓸 때만 `linkedin_text`를 적는다(글 주소는 자동으로 붙는다). 문구는 발행 PR에서 사람이 검수한다.
- merge되어 배포가 성공하면 GitHub Action(`site.yml`의 `linkedin` 작업, `scripts/post-linkedin.ts`)이 다음을 처리한다.
  1. `published`이고 `linkedin: true`인 영어 글 중 게시 기록이 없는 글을 찾는다. 이미 발행한 글에 나중에 `linkedin: true`를 더해도 올라간다.
  2. 글 URL이 200을 반환하는지 확인한다.
  3. LinkedIn API(`POST /v2/ugcPosts`, 공개 범위 `PUBLIC`)로 작성자 개인 피드에 게시한다. 링크 카드 이미지는 글 페이지의 `og:image` 주소를 `media[].thumbnails`로 보낸다. 이 값이 없으면 카드에 이미지가 나오지 않는다. `thumbnails`는 [UGC Post API 문서](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/ugc-post-api)의 항목이고 Share on LinkedIn 문서에는 없다. 개인 계정 테스트 게시로 이미지가 보이는 것을 확인했다(2026-11-26).
  4. 게시 기록으로 태그 `linkedin/<slug>`를 push한다. 태그 메시지에 게시물 ID와 게시 시각을 적는다. `master`는 PR로만 바꿀 수 있어서 파일로 커밋하지 않는다.
- 같은 글을 두 번 게시하지 않는다. 태그가 있으면 건너뛴다. 응답을 받지 못했거나 5xx가 왔거나 태그 push가 실패하면 Action이 실패하고 확인 방법과 태그 명령을 출력한다. **LinkedIn 피드를 확인하고, 올라가 있으면 태그를 push하기 전에는 Re-run도 다음 merge도 하지 않는다**(하면 다시 올라간다).
- 한 글이 실패해도 다음 글은 올린다. 태그를 남기지 못했을 때만 그 자리에서 멈춘다. `linkedin_text`는 2800자까지다(게시물 한도 3,000자에서 글 주소 자리를 뺐다).
- LinkedIn에서 지우거나 고치는 일은 사람이 LinkedIn에서 한다.
- 확인만 하기: `SITE_URL=<사이트 주소> node scripts/post-linkedin.ts --dry-run`은 요청 내용만 출력한다. 대상 선정과 요청 형식은 `npm run test:linkedin`(verify에 포함)이 검사한다.
- 인증 방식:
  - LinkedIn 공식 API의 Share on LinkedIn 제품(`w_member_social` 권한)을 쓴다. 앱과 토큰은 사람이 만든다.
  - 저장소 Secrets `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_PERSON_ID`(`/v2/userinfo`의 `sub`), Variable `LINKEDIN_TOKEN_ISSUED_AT`.
  - 액세스 토큰은 60일 만료다. 자동 갱신(refresh token)은 일부 파트너만 쓸 수 있다.
  - 갱신: 작성자 컴퓨터에서 `npm run linkedin:token`을 실행한다. 토큰 발급과 로그인은 브라우저에서 사람이 하고, 스크립트는 클립보드의 토큰을 `/v2/userinfo`로 확인한 뒤 승인을 받아 Secrets 2개와 Variable을 저장한다. 공개 저장소이므로 토큰과 계정 ID를 파일·출력·명령 인자에 남기지 않는다. macOS 전용이다.
  - 만료 2주 전에 `linkedin-token.yml`이 이슈로 알린다. 공개 저장소에서 60일 동안 활동이 없으면 GitHub가 예약 실행을 끌 수 있다.
  - 근거: [Share on LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin), [OAuth 흐름](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow), [refresh token](https://learn.microsoft.com/en-us/linkedin/shared/authentication/programmatic-refresh-tokens)
  - [Posts API 문서](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api)는 Posts API가 ugcPosts를 대체한다고 적었다. 종료 날짜는 없고(2026-11-26 확인), Share on LinkedIn 문서는 ugcPosts를 안내한다. 게시가 실패하기 시작하면 Posts API 이전을 검토한다.

### 9.4 블로그 MCP 서버 (Phase 2b, D10)

목적: 콘텐츠 규칙을 문서(프롬프트)가 아니라 코드로 강제하고, MCP를 지원하는 어떤 클라이언트에서든 블로그를 운영한다. 만드는 과정 자체가 이 블로그의 글감이다.

- 위치와 실행: 사이트 저장소 `mcp/`, TypeScript, 공식 TypeScript SDK, 로컬 stdio. 호스팅하지 않는다.
- 규칙의 단일 소스: frontmatter 스키마와 검사 로직을 사이트와 MCP 서버가 함께 쓴다. Astro 전용 부분(`image()` 등)을 뺀 공통 스키마를 분리한다.
- 도구 (첫 버전)
  | 도구 | 하는 일 |
  |---|---|
  | `list_posts` | 글 목록, 언어, 상태, 번역본 유무 |
  | `check_post` | 한 편에 대해 스키마와 콘텐츠 검사 |
  | `translate_post` | published 원문 1편의 반대 언어 번역 초안 저장. `status: draft`, `ai_assisted: true`, `translated_from` 강제 |
  | `list_templates` | 글 템플릿 목록과 각 템플릿을 쓰는 경우(§5.7) |
  | `create_draft` | 새 초안 파일 생성. `status: draft`, `ai_assisted: true` 강제. 템플릿과 선택 블록을 고를 수 있다 |
- 하지 않는 것: commit, push, PR 생성, status를 reviewed·published로 바꾸기. 이것들은 기존 절차(사용자 승인, `create-pr`, `publish-post`)를 따른다.
- 비밀값을 쓰지 않는다. 번역문은 클라이언트의 모델이 쓰고 서버는 API를 호출하지 않는다.
- 스킬(`draft-post`, `publish-post` 등)은 MCP 도구를 부르는 절차서로 남긴다.

## 10. 배포

- 흐름: `master` merge → install → `astro check` → build → HTML 검사 스크립트 → Pages 배포
- HTML 검사 스크립트는 다음을 확인한다.
  - dist의 모든 글 HTML에 title, description, canonical, h1, 본문이 있는지
  - draft와 reviewed 글이 dist에 없는지
  - `404.html`이 있는지
- 환경 변수: `SITE_URL`. Phase 6 전까지는 `https://jcheyoon.github.io`.

## 11. 열린 결정

| # | 항목 | 결정 / 권장 | 상태 |
|---|---|---|---|
| D1 | 콘텐츠 원본 | git Markdown | 승인 (2026-11-23) |
| D2 | 프레임워크 | B Astro | 승인 (2026-11-23) |
| D3 | 커스텀 도메인 | 보유 중인 도메인을 Phase 6에서 연결. 주소는 그때 받는다 | 승인 (2026-11-23) |
| D4 | 호스팅 | 우선 GitHub Pages, 광고 도입 전(Phase 6) 재검토(GitHub Pages 상업 이용 제한 문구 때문) | 대기 |
| D5 | 끝 슬래시 | `/post/slug/` (디렉터리 방식, 끝 슬래시 있음) | 승인 (2026-11-23) |
| D6 | 관리자 SPA | 은퇴. 번역과 LinkedIn은 git 파이프라인에서 처리(§9.2, §9.3) | 승인 (2026-11-23) |
| D7 | legacy 보관 위치 | `legacy/spa/`. 2026-11-26 삭제(git 기록 `19ddd8b`) | 승인 (2026-11-23, 2026-11-26 삭제) |
| D8 | 번역 | 한국어 ↔ 영어 양방향. 원문을 발행할 때 반대 언어 번역 초안을 자동 생성하고, 검수 후 원문과 함께 발행 | 승인 (2026-11-23, 2026-11-24 양방향·자동 생성, 2026-11-27 함께 발행으로 변경) |
| D9 | 본문 디자인 | §6.1의 요소로 본문을 꾸민다. 저장소 카드·스포일러·수식은 제외 | 승인 (2026-11-25) |
| D10 | 블로그 MCP 서버 | TypeScript, 사이트 저장소 `mcp/`, 로컬 stdio. 콘텐츠 규칙을 코드로 강제한다(§9.4) | 승인 (2026-11-25) |
| D11 | 영어 사이트 구조 | 한국어 사이트와 같은 구조를 `/en/` 아래에 둔다. 언어 전환은 같은 페이지로 이동 | 승인 (2026-11-25) |
| D12 | OG 이미지 | cover가 없으면 빌드가 글마다 자동 생성 | 승인 (2026-11-25) |
| D13 | 태그 형식 | 영문 소문자, 숫자, 하이픈. 번역본도 같은 태그 | 승인 (2026-11-25) |
| D14 | 테마 토글 | 라이트/다크 2단계. 처음엔 시스템 설정, 선택은 저장 | 승인 (2026-11-25) |
| D15 | 모바일 UI | 하단 탭 바, 목록 필터(카테고리·태그 시트), 목차 바텀 시트, 숨는 헤더, 페이지 전환. Phase 3 마지막(§6.2) | 승인 (2026-11-25) |
| D16 | 검색 | 헤더 버튼 + ⌘K + 검색 창, 모바일 전체 화면, Pagefind. 모바일 UI 완성을 위해 Phase 3으로 당김(§6.3) | 승인 (2026-11-25) |
| D17 | 댓글 | Giscus(GitHub Discussions, GitHub 로그인). 로그인이 봇·도배 방지를 겸하고, 회원 정보를 직접 보관하지 않으며, 서버가 필요 없다. 비개발자 독자의 익명 댓글 요구가 실제로 생기면 이름+비밀번호(수정·삭제용)+Turnstile+횟수 제한+첫 댓글 승인을 갖춘 직접 구현을 그때 검토한다. 설정(2026-11-26): 저장소 Discussions의 `Comments` 카테고리(Announcement 형식), 값은 `site.config.ts`. 원문과 번역본은 댓글을 함께 쓴다(`mapping: specific`, 제목은 slug, `strict`). 댓글은 검색 노출 대상이 아니라서 언어로 나누지 않는다. 화면 문구만 글의 언어를 따른다. §8 스크립트와 개인정보 처리방침에 giscus를 넣었다 | 승인 (2026-11-26) |
| D18 | AI 독자 대응 | 공개 읽기 전용 MCP 서버(도구: `search_posts`, `get_post`, `list_posts`)를 `blog-backend`(Go, Render)에 둔다. 사이트 빌드가 공개 글만 담은 `/data/posts.json`을 만들고 서버가 그것을 읽는다. 형식: `{generatedAt, site, posts: [{slug, lang, url, title, description, category: {slug, name}, tags, publishedAt, updatedAt|null, translations: {<lang>: url}, body}]}`(필드 camelCase, `body`는 frontmatter를 뺀 Markdown 원문, 한 파일에 전체 글. 수백 편 규모에서 서버가 한 번 받아 메모리에서 검색하기 위함. 몇 MB를 넘으면 목록과 본문을 나눈다). DB 없음. 답은 독자의 AI가 만들므로 블로그는 API 비용을 내지 않는다. 사이트 안 질문 위젯(블로그가 API 비용 부담)과 `llms.txt`·글 Markdown 공개(2026-11 조사에서 꾸준히 읽는 AI가 Claude Code뿐)는 하지 않는다. 사이트 데이터 파일과 로컬 연습은 단계와 관계없이 먼저 해도 되고, 배포는 첫 글 발행 뒤(ROADMAP Phase 5) | 승인 (2026-11-26) |

## 12. 완료 정의 (모든 기능 공통)

- SPEC의 해당 요구사항을 충족한다.
- `astro check`, build, HTML 검사가 통과한다.
- 375px 모바일과 데스크톱 화면에서 확인했다.
- 동작하지 않는 UI가 없다.
- 결정이 바뀌었으면 SPEC, ROADMAP, rules를 같은 PR에서 고친다.
