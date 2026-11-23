# claude

이 폴더는 Claude-assisted 작업을 위한 저장소 로컬 설정/문서.
루트 `AGENTS.md`가 `CLAUDE.md`와 `.claude/` 디렉터리를 컨벤션의 원천으로 참조한다.

## 구성

- `README.md` — 이 파일 (폴더 용도와 구조 설명)
- `rules/` — 규칙 문서. `.md` 파일은 자동으로 로드된다. `paths` frontmatter가 있으면 해당 파일을 다룰 때만 로드된다.
  - 콘텐츠와 운영:
    - `content.md` — 발행 상태, 출처, 저작권, 광고·제휴 표시, 번역·소셜 게시
    - `project-scope.md` — 로드맵 단계, 완성도, 보존, 배포·브랜치 규칙
    - `rendering-seo.md` — `src/**` 작업 시 적용. 정적 HTML, SEO head, 링크 규칙
  - 레거시 SPA (Phase 1에서 `legacy/spa/`로 이동 예정):
    - `coding-style.md` — TS 설정, import, React 컴포넌트, 스타일링 규칙
    - `architecture.md` — 엔트리/프로바이더/라우팅/데이터 흐름/캐시/인증 구조
    - `naming-convention.md` — 파일·컴포넌트·API 함수·상수·query key·타입 명명
    - `api-conventions.md` — apiRequest 경유 규칙, 엔드포인트 목록, 관례
    - `environment-and-tooling.md` — 스크립트, 환경 변수, 인증 저장, 주의사항
- `skills/` — 반복 작업용 스킬.
  - 형식: 스킬 이름으로 폴더를 만들고, 그 안에 파일 이름을 정확히 `SKILL.md`로 둔다(`skills/<이름>/SKILL.md`). 다른 형식은 인식되지 않는다.
  - 콘텐츠·작업 흐름:
    - `draft-post/` — 블로그 초안 1편 작성
    - `review-post/` — 8항목 검수표 작성. 사람이 승인하면 reviewed로 기록
    - `publish-post/` — reviewed 글을 발행하고 PR 준비
    - `create-pr/` — 한글 PR 초안 작성 → 사용자 승인 → push와 PR 생성·갱신
  - 레거시 SPA 전용 (Phase 1 이후 새 코드에는 쓰지 않음):
    - `add-api-fetcher/`, `add-data-driven-component/`, `create-ui-component/`, `verify-project/`
- `settings.json` — 권한(허용/질의/금지), 허용 도구, 환경 변수 기본값

## 사용 방법

- 작업 전: `docs/ROADMAP.md`의 현재 단계와 `docs/SPEC.md`를 확인
- 다단계 작업: 해당 `skills/<이름>/SKILL.md` 로드 (AGENTS.md 지침)
- `settings.json`의 `env.VITE_API_BASE_URL`은 루트 `.env`의 값과 일치시킨 상태
  (.env는 gitignore 대상이므로, 값이 바뀌면 여기도 함께 갱신)
