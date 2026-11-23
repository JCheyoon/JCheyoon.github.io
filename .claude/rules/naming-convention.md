# 명명 규칙 (레거시 SPA 전용)

> 레거시 SPA(`src/`의 Vite + React 앱) 전용 규칙이다.
> 이 앱은 Phase 1에서 `legacy/spa/`로 옮기고 은퇴한다(docs/SPEC.md D6, D7).
> 새 코드의 명명 규칙은 Phase 1에서 실제 코드를 기준으로 새로 쓴다.

실제 코드에서 확인된 패턴.

## 파일명

- 페이지: PascalCase — `Home.tsx`, `About.tsx`, `Post.tsx` (src/components/pages/)
- 어드민 컴포넌트: PascalCase — `AdminDashboard.tsx`, `CategoryManager.tsx`
- 공유/기능 컴포넌트: 소문자 camelCase — `postCard.tsx`, `postList.tsx`, `sidebarMenu.tsx`, `textEditor.tsx`, `footer.tsx`, `cardProduct.tsx`
- → 폴더 내 기존 명명을 따르고 같은 폴더 안에서 일관성을 유지. 새 페이지/어드민 화면은 PascalCase 권장

## 컴포넌트

- 컴포넌트명 = 파일명과 동일한 이름, default export
- props 타입: `XxxProps` 인터페이스 (PostCardProps, PostListProps, SidebarMenuProps, Navbar04Props)
- 훅: `use` 접두사 + named export (`useAdminAuth`, `useCategoryCache`, `useInvalidateCategoryCache`, `useApiClient`)

## API 함수 (src/lib/)

- 읽기: `fetch` 접두사 + 명사 — `fetchPosts`, `fetchPost`, `fetchPostBySlug`, `fetchAllPosts`, `fetchCategoryTree`, `fetchFlatCategories`
- 쓰기/변경: 동사 + 명사 — `createCategory`, `updateCategory`, `deleteCategory`, `createAdminPost`, `updatePost`, `deletePost`, `loginAdmin`
- 어드민 함수는 `token: string`을 마지막 파라미터로 받고 `Authorization: Bearer` 헤더를 붙임

## 상수

- 모듈 레벨 상수: UPPER_SNAKE — `ADMIN_TOKEN_STORAGE_KEY`, `POSTS_PER_PAGE`, `DEFAULT_API_BASE_URL`, `CATEGORY_KEY`

## Query Key (react-query)

- 문자열 배열, 도메인 우선: `["posts", categorySlug]`, `["post", slug]`, `["categories"]`
- 어드민 키는 `"admin"` 접두사: `["admin", "posts"]`, `["admin", "post", id]`, `["admin", "categories"]`

## 타입

- 도메인 타입은 `src/types/types.ts` 단일 파일에 정의: `Post`, `Category`, `OutletContext`
