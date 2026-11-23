---
name: create-ui-component
description: [레거시 SPA 전용 — Phase 1 이후 새 코드에는 쓰지 않는다] shadcn 스타일 UI 컴포넌트 생성. Tailwind 시맨틱 토큰과 기존 프리미티브 재사용.
---

# UI 컴포넌트 생성

## 목적

`src/components/ui/` 또는 기능 폴더에 Tailwind 시맨틱 토큰 기반 컴포넌트를 만든다.

## 트리거

- 재사용 UI 요소(카드, 버튼, 리스트, 네비게이션 등) 필요
- shadcn 프리미티브를 조합한 화면 조각 필요
- 새 레이아웃/내비게이션 요소 추가

## 절차

1. 배치 결정: 범용 → `src/components/ui/`, 기능 전용 → 해당 기능 폴더 (`src/components/home/`, `src/components/post/` 등)
2. 저수준 프리미티브는 `@repo/shadcn-ui/components/ui/*`에서 import (Card, Button, Input, Select, NavigationMenu, Separator)
3. 스타일은 Tailwind 시맨틱 토큰 사용: `bg-card`, `text-foreground`, `border-border`, `bg-muted`, `text-muted-foreground`, `bg-primary`, `bg-accent-bar` 등
   - 조건부 클래스는 템플릿 리터럴 또는 `cn()` (`@repo/shadcn-ui/lib/utils.ts`)
4. props: `interface XxxProps` 정의, 필요한 경우 `ReactNode` children 사용
5. 아이콘은 `lucide-react`에서 import (Calendar, Hash, BookOpen, SunIcon 등)
6. default export + 파일명 규칙 준수 (폴더 관례에 따라 PascalCase 또는 소문자 camelCase)
7. 커스텀 CSS 대신 유틸리티 클래스 우선. 테마 토큰 추가가 필요하면 `src/index.css` 수정

## 예시 (sidebarMenu.tsx 패턴)

```tsx
interface SidebarMenuProps {
  tree: Category[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

const SidebarMenu = ({
  tree,
  selectedCategory,
  onSelect,
}: SidebarMenuProps) => {
  // ...
};
```

## 체크리스트

- [ ] 기존 프리미티브 재사용 (새 컴포넌트 중복 생성 금지)
- [ ] 시맨틱 토큰 사용 (하드코딩 색상 지양)
- [ ] 폴더 내 기존 명명 규칙 준수
