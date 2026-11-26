# 로드맵

**현재 단계: Phase 4** (Phase 3 완료 2026-11-25)

진행 원칙:

- 단계는 순서대로 진행한다. 완료 기준을 통과하기 전에는 다음 단계 기능을 시작하지 않는다.
- 작업량은 집중 작업일 기준 추정치다.
- 브랜치와 배포 규칙은 `docs/SPEC.md` §3.1을 따른다. 라이브 사이트는 `master` merge로 자동 배포된다.

## 현재 상태 (2026-11-23 진단)

| 항목 | 상태 |
|---|---|
| 빌드 | `npm run build` 실패 (타입 에러 3개), lint 에러 9개 |
| 미완성 페이지 | About, Archive, Portfolio가 빈 페이지 |
| 동작하지 않는 UI | 검색창, 언어 선택, GitHub/LinkedIn 링크 |
| 관리자 | 초안이 목록에 보이지 않음, 한글 제목은 slug 생성 불가 |
| 글 | DB에 글이 없음 (작성자 확인, 3036-11-34). 옮길 글이 없다 |

**기존 SPA의 버그는 고치지 않는다.** 이전하면 사라질 코드이기 때문이다.

## 기능 정리 (현재 → 결정)

| 기능 | 현재 | 결정 | 단계 |
|---|---|---|---|
| 홈 글 목록 | 동작. 클라이언트 fetch, 버튼 페이지네이션 | 정적으로 재구현, 링크 페이지네이션 | 1 |
| 글 상세 | 동작. 본문 스타일과 메타 없음 | 재구현 + SEO + typography | 1 |
| 카테고리 | 동작. `?category=이름` 방식 | `/category/[slug]` 페이지로 재구현 | 1 |
| 소개 | 빈 페이지 | 작성 (운영자, 목적, 제작 방식) | 1 |
| 프로필 카드, 소셜 링크 | 링크가 아닌 텍스트 | 실제 링크로 재구현 | 1 |
| 404 | 없음 | 신규 | 1 |
| sitemap, RSS, robots | 없음 | 신규 | 1 |
| 언어 선택 En/Kr | 동작 안 함 | 1에서 제거. 2a에서 같은 페이지의 다른 언어판으로 가는 링크(글은 번역본이 있을 때만) | 1, 2a |
| 태그 | 글에 표시만 함 | `/tag/[tag]` 페이지 | 3 |
| 아카이브 | 빈 페이지 | 연·월별 목록 | 3 |
| 테마 토글 | 동작하지만 저장 안 됨 | 아일랜드로 재구현, 선택 저장 | 3 |
| OG 이미지 | 없음 | 신규 | 3 |
| 문의, 개인정보 처리방침, 이용약관 | 없음 | 신규 | 4 |
| 제휴 표시 컴포넌트 | 없음 | 신규 | 4 |
| LinkedIn 자동 업로드 | 계획만 있음 | 글마다 선택(`linkedin: true`, 영어만) → merge 후 Action이 게시 (SPEC §9.3) | 4 |
| 검색창 | 동작 안 함 | 정적 검색(Pagefind)으로 구현 | 3 |
| 포트폴리오 | 빈 페이지 | 하지 않음. 블로그 자체가 포트폴리오다(2026-11-26 작성자 결정) | - |
| 자동 번역 | 계획만 있음 | 한국어 ↔ 영어 양방향. 발행하면 MCP 도구가 반대 언어 번역 초안을 자동 생성, 검수 후 발행 (SPEC §9.2) | 2a, 2b |
| 커스텀 도메인 | 보유, 미연결 | 연결 | 6 |
| 광고 슬롯, CMP | 없음 | 신규 | 6 |
| 댓글 | 없음 | 후보. Giscus로 결정(SPEC D17) | 4 |
| 이 글에 질문하기 | 백엔드만 있음 | 하지 않음. 공개 MCP 서버로 대신함(SPEC D18) | - |
| 관리자 (로그인, 대시보드, 에디터, 카테고리 관리) | 동작하지만 버그 있음 | 은퇴. `legacy/spa/`에 보관했다가 2026-11-26 삭제 | 1 |
| MCP 서버 | 계획만 있음 | 블로그 운영용 MCP 서버를 직접 만든다 (SPEC §9.4, D10) | 2b |
| Ask my blog (벡터 검색) | 계획만 있음 | 보류 | — |

## Phase 0: 결정과 정리 (1~2일)

- [x] D1~D3, D6~D8 결정 (2026-11-23)
- [x] 글 이전 필요 여부 확인: DB에 글이 없어서 이전하지 않는다 (2026-11-23)
- [x] 규칙, 스킬, SPEC, ROADMAP 적용 (JCheyoon.github.io #3, #4)
- [x] 백엔드 문서 정비 (blog-backend #5, #6, #7)

완료 기준: PR 1, PR 2 merge

## Phase 1: 공개 가능한 최소 사이트 (완료 2026-11-25)

작업 브랜치: `migrate/astro` (JCheyoon.github.io #5, merge 2026-11-24)

- [x] 기존 SPA를 `legacy/spa/`로 이동하고, 레거시 규칙에 `paths: ["legacy/**"]` 적용 (레거시 규칙·스킬과 `legacy/`는 2026-11-26 삭제)
- [x] Astro 골격, `site.config.ts`(`SITE_URL=https://jcheyoon.github.io`), `categories.ts`
- [x] 콘텐츠 스키마와 검증 규칙 (`src/content.config.ts`, `scripts/check-content.mjs`)
- [x] 반응형 레이아웃, 홈과 페이지네이션, 글, 카테고리, 소개, 404
- [x] SEO head, JSON-LD, sitemap, RSS, robots, typography, 이미지 처리
- [x] GitHub Actions 워크플로(PR 검증, 수동 배포)와 HTML 검사 스크립트
- [x] 끝 슬래시 정책 결정 (D5): `/post/slug/` (2026-11-23)
- [x] 새 코드 기준으로 `site-code` 규칙과 `verify-site` 스킬 작성 (레거시 `verify-project`는 2026-11-26 삭제)
- [x] 전환 (SPEC §3.1, 2026-11-25)
  1. Astro 사이트 PR을 `master`에 merge한다. (완료)
  2. Settings → Pages → Source를 "GitHub Actions"로 바꾼다 (사람이 직접). (완료)
  3. 바로 Actions 탭에서 Site 워크플로를 수동 실행(Run workflow)해 배포한다. (완료)
  4. 라이브 사이트를 확인한다(아래 완료 기준). (curl 항목 완료)
  5. 확인되면 `site.yml`의 push 트리거 주석을 푸는 PR을 올린다. 이후 master merge 시 자동 배포된다. (완료)

완료 기준:
- [x] 라이브 홈·소개 페이지 HTML에 title, description, canonical이 있다 (curl로 확인, 2026-11-25).
- [x] 없는 URL이 404 상태를 반환한다 (2026-11-25).
- [x] 375px 화면에서 확인했다 (작성자 확인, 2026-11-25).
- [x] Lighthouse 목표를 달성했다 (작성자 측정 2026-11-25: 성능·SEO 등 100, 접근성 84 → 원인인 글자 대비를 #10에서 수정. 작성자 판단으로 완료 처리).
- 글 페이지 템플릿은 샘플 글로 CI에서 검증한다. 라이브 글 페이지 확인은 첫 글을 발행할 때(Phase 5) 한다.

> 2026-11-24 순서 변경: 기능 개발(Phase 2~4)을 먼저 하고, 글 작성(Phase 5)을 그 뒤에 한다.
> 첫 글은 기능을 다 만든 뒤 쓰면서 발행 흐름, 번역, LinkedIn 공유를 한꺼번에 실제로 검증한다.
> 검색 노출과 수익은 글이 공개된 뒤부터 쌓이므로, Phase 2~4는 기간을 정해 두고 진행한다.

## Phase 2: 번역 구조와 블로그 MCP 서버 (완료 2026-11-25)

### 2a. 사이트 번역 구조 (한국어 ↔ 영어, 2~3일)

- [x] frontmatter `lang`, `translated_from` 필드와 검증 (SPEC §5.1, §9.2)
- [x] 영어 사이트 (D11): `/en/`, `/en/page/[n]/`, `/en/post/[slug]/`, `/en/category/[slug]/`, `/en/about/`, `/en/rss.xml`
- [x] 영어 화면 문구(메뉴, 날짜 형식 등), hreflang, sitemap 대체 언어
- [x] 헤더 오른쪽 언어 전환 링크: 글은 번역본이 있을 때만, 나머지는 항상 같은 페이지로
- [x] 원문이 바뀌면 번역본을 재검수 대상으로 표시하는 빌드 경고

완료 기준: 샘플 글(한국어 원문, 영어 원문, 번역본)로 템플릿 검증 빌드가 통과하고, hreflang과 전환 링크가 HTML에 들어간다.

### 2b. 블로그 MCP 서버 (SPEC §9.4, D10)

- [x] 사이트와 함께 쓰는 공통 스키마·검사 로직 분리
- [x] `mcp/` 서버 골격 (TypeScript, 공식 SDK, stdio)과 Claude Code 연결 설정
- [x] 도구: `list_posts`, `check_post`
- [x] 도구: `translate_post`, `create_draft`, `list_templates`
- [x] 글 템플릿 4종과 선택 블록 2종 (SPEC §5.7), `draft-post`가 주제에 맞는 템플릿을 제안
- [x] `publish-post`가 원문 발행 뒤 `translate_post`를 이어서 실행하도록 스킬 수정
- [x] 도구가 규칙을 강제하는지 확인하는 테스트 (잘못된 입력이 거부되는지)

완료 기준: Claude Code에서 MCP 도구로 샘플 원문의 번역 초안을 만들고, 그 초안이 `npm run verify`를 통과한다.

## Phase 3: 사이트 완성도 (완료 2026-11-25)

- [x] 본문 디자인 (SPEC §6.1, D9): 제목 앵커, 링크, 인라인 코드, 코드 블록(Expressive Code), 목록 기호, 인용문, 안내 상자, 이미지·구분선, 글 카드, 메타 아이콘, 이전·다음 글 버튼, 목차, 맨 위로 버튼
  - `template-check.md`에 모든 요소를 넣어 템플릿 검증 빌드로 확인한다.
- [x] 태그 페이지(형식 검사, 사이드바 태그 목록, 글·카드의 태그 링크), 아카이브(헤더 메뉴), 테마 토글(D14)
- [x] 목록 카드 메타 아이콘, 페이지 번호 버튼
- [x] OG 이미지 자동 생성(D12): `/og/<slug>.png`, `/og/en/<slug>.png`, Pretendard, 글쓴이·날짜·카테고리
- [x] 모바일 UI (SPEC §6.2, D15): 하단 탭 바, 목록 필터(카테고리·태그 바텀 시트), 글 목차 바텀 시트, 스크롤하면 숨는 헤더, 페이지 전환(View Transitions)
- [x] 정적 검색 (SPEC §6.3, D16, 2026-11-25 Phase 4에서 당김): 헤더 검색 버튼 + ⌘K/Ctrl+K + 검색 창, 모바일은 하단 탭의 검색이 전체 화면 검색, Pagefind
- [x] 카테고리·태그 목록 페이지 나누기, 사이드바 카테고리 "더보기"
- [x] PR 템플릿 작성(검수 체크리스트): `.github/pull_request_template.md`
- [x] `master` 브랜치 보호 (ruleset `protect-master`: PR 필수, `검증과 빌드` 통과 필수, 강제 push·삭제 금지. 2026-11-25 작성자 설정)

완료 기준: 새 페이지가 `npm run verify`를 통과하고, 동작하지 않는 메뉴가 없다. 본문 요소가 라이트·다크 모두에서 읽기 쉬운지 작성자가 로컬에서 확인했다.

## Phase 4: 신뢰와 공유 기능 (3~4일)

- [x] 문의, 개인정보 처리방침, 이용약관(+영어판, 푸터 링크). 광고 고지는 AdSense 신청 때 추가(Phase 6)
- [ ] 제휴 표시 컴포넌트와 제휴 도메인 목록
- [ ] LinkedIn 공유 (SPEC §9.3)
  - LinkedIn 앱 생성, Share on LinkedIn 제품 추가, 토큰을 Secrets에 등록 (사람이 직접)
  - [x] LinkedIn 페이지와 앱 생성, 제품 2개 추가 (작성자, 2026-11-26)
  - [ ] 토큰 발급, Secrets·Variable 등록 (작성자)
  - [x] 개인 피드 테스트 게시: 게시와 카드 이미지 확인 (작성자, 2026-11-26)
  - [x] 영어 글 `linkedin: true`면 merge 후 Action이 게시하고 태그로 기록. `publish-post`가 올릴지 묻는다 (2026-11-26 작성자 결정)
  - [x] 토큰 만료 알림 워크플로

완료 기준: 필수 페이지가 공개되고, LinkedIn 게시 Action이 샘플로 검증된다(실제 게시는 Phase 5).

## Phase 5: 글 작성과 실제 검증 (이후 운영)

- [ ] 첫 글 작성 → `review-post` → `publish-post` → 번역 초안 검수·발행 → LinkedIn 게시
  - 첫 글 후보: "블로그를 Vite에서 Astro로 옮긴 이유" (작성자 메모 필요)
- [ ] 라이브 글 페이지 확인 (curl로 본문, title, description, canonical, hreflang)
- [ ] Search Console 등록 (`https://jcheyoon.github.io` URL 접두어 속성), sitemap 제출
- [ ] 댓글: Giscus(SPEC D17, 2026-11-26 결정). 첫 글 발행 뒤 붙인다. 처리방침·SPEC §8에 giscus 추가
- [ ] 쿠키 없는 방문 통계(후보: Cloudflare Web Analytics). 붙일 때 공식 문서로 확인하고, 개인정보 처리방침과 SPEC §8에 추가
- [ ] 공개 읽기 전용 MCP 서버 (SPEC D18). 사이트 데이터 파일과 백엔드 로컬 연습은 단계와 관계없이 먼저 시작해도 된다(2026-11-26 작성자 결정)
  - [x] 사이트: 빌드가 공개 글 데이터(`/data/posts.json`)를 만든다(2026-11-26)
  - 백엔드(작성자가 Go로 직접): `/mcp`에 `search_posts`·`get_post`·`list_posts`, 횟수 제한. 로컬에서 Claude Code로 연결해 확인
  - 첫 글 발행 뒤 Render에 배포하고, 연결 방법을 글로 쓴다
- [ ] 주 1~3편 발행을 계속함

완료 기준: draft → reviewed → published 기록과 번역본 검수 기록이 git에 남은 글이 1편 이상 있고, Search Console에서 색인이 확인되며, 글 1편이 LinkedIn에 게시된다.

## Phase 6 (마지막): 도메인 연결과 수익화

시작 조건: Phase 5 완료, 원본 글이 충분히 쌓였을 것, 도메인 주소 확보. AdSense 기준은 신청 시점에 공식 문서로 확인한다.

- [ ] 호스팅 재검토 (SPEC D4)
- [ ] 커스텀 도메인 연결
  - `SITE_URL` 변경, CNAME/DNS 설정
  - github.io → 도메인 리다이렉트 확인
  - Search Console 주소 변경 절차 확인
- [ ] AdSense 신청, Google CMP 설정 (EEA·UK·스위스), 개인정보 처리방침에 광고 조항 추가
- [ ] 높이를 고정한 광고 슬롯 (본문 첫 문단 뒤, 글 끝, 데스크톱 사이드바)
- [ ] 제휴 글 (직접 써 본 비교·후기만)
- [ ] (선택) 뉴스레터, 디지털 상품

## 하지 않을 것 (재검토 전까지)

- 사람 검수 없는 자동 번역 발행, 사람 검수 없는 소셜 자동 게시
- 예약·대량 발행
- 관리자 웹 에디터 재구현
- 벡터 검색
