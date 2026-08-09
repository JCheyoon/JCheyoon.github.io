# claude

이 폴더는 Claude-assisted 작업을 위한 저장소 로컬 설정/문서.
루트 `AGENTS.md`가 `CLAUDE.md`와 `.claude/` 디렉터리를 컨벤션의 원천으로 참조한다.

## 구성

- `README.md` — 이 파일 (폴더 용도와 구조 설명)
- `rules/` — 코드에서 확인된 규칙/아키텍처 문서
  - `coding-style.md` — TS 설정, import, React 컴포넌트, 스타일링 규칙
  - `architecture.md` — 엔트리/프로바이더/라우팅/데이터 흐름/캐시/인증 구조
  - `naming-convention.md` — 파일·컴포넌트·API 함수·상수·query key·타입 명명
  - `api-conventions.md` — apiRequest 경유 규칙, 엔드포인트 목록, 관례
  - `environment-and-tooling.md` — 스크립트, 환경 변수, 인증 저장, 주의사항
- `skills/` — 반복 작업용 스킬 정의 (각 하위 폴더의 `SKILL.md`)
  - `add-api-fetcher/` — src/lib API 함수 추가
  - `add-data-driven-component/` — react-query 데이터 화면 추가
  - `create-ui-component/` — shadcn 스타일 UI 컴포넌트 생성
  - `verify-project/` — build/lint 검증 절차
- `settings.json` — 권한(허용/질의/금지), 허용 도구, 환경 변수 기본값

## 사용 방법

- 작업 전: 관련 `rules/*.md`를 읽어 컨벤션 확인
- 다단계 작업(검증/리팩터링/배포 등): 해당 `skills/SKILL.md` 로드 (AGENTS.md 지침)
- `settings.json`의 `env.VITE_API_BASE_URL`은 루트 `.env`의 값과 일치시킨 상태
  (.env는 gitignore 대상이므로, 값이 바뀌면 여기도 함께 갱신)
