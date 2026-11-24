---
paths:
  - "legacy/**"
---

# 환경 및 도구 (레거시 SPA 전용)

> 레거시 SPA(Vite + React 앱) 전용 규칙이다. 코드는 `legacy/spa/`로 옮겨 은퇴했다(docs/SPEC.md D6, D7).
> 아래의 `src/...` 같은 경로는 모두 `legacy/spa/` 기준이다(예: `legacy/spa/src/lib/api.ts`).
> 새 기능을 이 구조로 만들지 않는다.

## 스크립트 (package.json)

- `npm run dev` — Vite 개발 서버
- `npm run build` — `tsc -b && vite build` (타입체크 포함)
- `npm run lint` — `eslint .`
- `npm run preview` — 빌드 결과 로컬 프리뷰
- `npm run deploy` — `gh-pages -d dist` (homepage: https://JCheyoon.github.io)
  - Phase 1 전환 전까지 실행하지 않는다(docs/SPEC.md §3.1). 라이브 사이트를 덮어쓴다.
- 테스트 스크립트는 없음 (package.json 확인 완료) → 자동 검증은 build + lint가 유일
- 2026-11-23 기준 `npm run build`는 타입 에러 2개로, `npm run lint`는 에러 9개로 실패한다.
  - 타입 에러 위치: `postCard.tsx:31`, `api-context.tsx:15`
  - SPA 은퇴 예정이라 고치지 않는다.

## 환경 변수

- `.env` 파일 (gitignore 대상)에 `VITE_API_BASE_URL=http://localhost:8080` 존재
- `src/lib/api.ts`가 `import.meta.env.VITE_API_BASE_URL`로 읽음.
  - 미설정이면 `undefined`가 되어 첫 요청에서 예외가 난다. 빈 문자열로 대체되지 않는다.

## 인증/저장

- 어드민 토큰: `localStorage["blog.admin.token"]` — 키 변경 시 기존 세션 마이그레이션 필요
- 토큰 검증: `isAdminJwtUsable` (exp 30초 스큐)

## 주의사항

- 게시글 HTML은 `dangerouslySetInnerHTML`로 렌더 — 백엔드 출력의 안전성을 전제
- `textEditor.tsx`는 이미지/링크 URL을 `window.prompt`로 입력받음
- Tailwind v4: 토큰의 원천은 `src/index.css`의 `@theme inline` + CSS 변수.
  `tailwind.config.js`는 존재하지만 theme extend가 비어 있음
- shadcn `components.json`의 `utils` alias는 `@/lib/utils`로 되어 있으나 해당 파일은 없고,
  실제 `cn()`은 `src/shadcn-ui/lib/utils.ts`에 있음 (TODO: alias 정리 여부 검토)
- `dist/`는 gitignore 대상이며 `npm run deploy`가 `dist/`를 gh-pages로 배포
