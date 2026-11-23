# 코딩 스타일 (레거시 SPA 전용)

> 레거시 SPA(`src/`의 Vite + React 앱) 전용 규칙이다.
> 이 앱은 Phase 1에서 `legacy/spa/`로 옮기고 은퇴한다(docs/SPEC.md D6, D7).
> 새 코드의 스타일 규칙은 Phase 1에서 실제 코드를 기준으로 새로 쓴다.

`src/` 코드, `tsconfig.app.json`, `eslint.config.js`에서 실제로 확인된 규칙.

## TypeScript 설정 (tsconfig.app.json 기준)

- strict 모드: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` 활성화
- `verbatimModuleSyntax` → 타입 import는 반드시 `import type` 사용
- `erasableSyntaxOnly`, `moduleResolution: "bundler"`, `allowImportingTsExtensions`, `jsx: "react-jsx"`
- alias: `@/*`와 `@repo/*` 모두 `src/*`로 매핑 (vite.config.ts, tsconfig.app.json)

## import 규칙

- 값과 타입을 분리해서 import: `import { apiRequest } from "./api";` + `import type { Post } from "@/types/types";`
- shadcn 프리미티브는 `@repo/shadcn-ui/components/ui/*`에서 import (cardProduct.tsx, sidebarMenu.tsx, navbar-04에서 사용)
- 앱 컴포넌트/헬퍼는 `@/` 또는 `@repo/` 모두 사용이 관찰됨 (둘 다 src로 해석되므로 동작상 동일)
- `cn()` 유틸은 `@repo/shadcn-ui/lib/utils.ts`에 있음 (clsx + tailwind-merge)

## 문법/포맷

- 따옴표: double quotes, 문장 끝 세미콜론 사용 (코드 전체 일관)
- Prettier 3가 dependency로 존재하지만 `format` 스크립트나 린트 포맷 규칙은 없음 → 포맷은 기존 스타일을 수동으로 유지
- ESLint 구성: js/ts recommended + react-hooks(flat) + react-refresh(vite) + `globals.browser`, `dist` ignore

## React 컴포넌트

- 함수 컴포넌트를 화살표 함수로 정의 (`const Foo = () => {...}`)
- 기본 export 사용 (`export default Foo`). `React.FC` 타입은 미사용
- props는 `interface XxxProps`로 선언 후 비구조화
- 커스텀 훅은 named export + `use` 접두사:
  - `useAdminAuth`는 Provider 밖에서 throw (AdminAuthProvider.tsx)
  - `useApiClient`는 throw 없이 null을 반환할 수 있음 (api-context.tsx) — 두 패턴이 공존하므로 훅마다 확인 필요
- 이벤트 핸들러 타입은 `React.FormEvent`, `React.KeyboardEvent` 등을 인라인으로 사용

## 스타일링

- Tailwind 유틸리티 클래스 위주. 시맨틱 토큰 사용: `bg-background`, `text-foreground`, `bg-card`, `border-border`, `bg-muted`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `bg-accent-bar` 등
- 조건부 클래스는 템플릿 리터럴 또는 `cn()` 사용
- 커스텀 CSS는 `src/index.css`(전역 리셋 + 테마 토큰) 외에 추가하지 않는 것이 기본
- 다크 모드는 `dark` 클래스 + CSS 변수 (index.css의 `:root`/`.dark`)

## 주석/문자열 언어

- 한글 주석·UI 문자열과 영문이 혼재 (postCard.tsx 주석, AdminLogin 에러 메시지, textEditor 툴바 라벨 등). 둘 다 허용됨
