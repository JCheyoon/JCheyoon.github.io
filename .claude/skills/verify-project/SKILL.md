---
name: verify-project
description: [레거시 SPA 전용 — Phase 1 이후 새 코드에는 쓰지 않는다] 코드 변경 후 빌드/린트로 검증. 테스트 스크립트가 없는 프로젝트의 유일한 자동 검증 수단.
---

# 프로젝트 검증

## 목적

코드 변경 후 타입 에러/린트 이슈를 잡는다.
테스트 스크립트가 없는 프로젝트라 `npm run build` + `npm run lint`가 유일한 자동 검증 수단.

## 트리거

- 컴포넌트/API/설정 변경 후
- 커밋 전 최종 확인
- 오류 보고 후 원인 확인

## 절차

1. `npm run build` — `tsc -b` 타입체크 + Vite 번들 (strict, noUnusedLocals 등 위반 확인)
2. `npm run lint` — ESLint (react-hooks, react-refresh 포함)
3. 오류 발생 시:
   - 타입 에러 → `import type` 사용 여부(verbatimModuleSyntax), 미사용 변수, strict 위반 확인
   - 린트 에러 → react-refresh 규칙(컴포넌트 파일에서 비컴포넌트 export 금지) 등 확인
4. 동작 확인이 필요하면 `npm run dev` 후 브라우저에서 확인
5. 배포 전 점검: `npm run preview`로 빌드 산출물 확인 (선택)

## 참고

- 포맷 스크립트/프리커밋 훅이 없으므로 스타일 일관성은 수동 유지 (rules/coding-style.md)
- 카테고리 캐시 관련 변경 시 어드민에서 생성/수정/삭제 후 공개 사이드바 갱신 여부 확인
