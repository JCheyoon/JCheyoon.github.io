# 아키텍처 (레거시 SPA 전용)

> 레거시 SPA(`src/`의 Vite + React 앱) 전용 규칙이다.
> 이 앱은 Phase 1에서 `legacy/spa/`로 옮기고 은퇴한다(docs/SPEC.md D6, D7).
> 새 기능을 이 구조로 만들지 않는다. 새 구조는 docs/SPEC.md §3을 따른다.

실제 라우팅/데이터 흐름 기준으로 정리.

## 엔트리와 프로바이더

```
index.html → src/main.tsx → src/App.tsx
```

- App.tsx 프로바이더 체인: `ApiProvider` → `QueryClientProvider` → `AdminAuthProvider` → `RouterProvider`
- 라우터는 `createBrowserRouter` + `createRoutesFromElements`로 구성

## 라우팅 구조 (src/App.tsx)

- 공개 사이트 (`/` → `Root` 레이아웃):
  - `/` Home, `/about`, `/archive`, `/portfolio`, `/post/:slug`
- 어드민:
  - `/admin/login` → AdminLogin
  - `/admin` → RequireAuth(가드) → AdminLayout:
    - index: AdminDashboard, `posts/new`·`posts/:id/edit`: AdminPostEditor, `categories`: CategoryManager

## 공개 사이트 레이아웃 (src/components/routing/Root.tsx)

- Navbar04 + CardProduct + SidebarMenu + `<Outlet context={{ selectedCategory }}>` + Footer
- 카테고리 선택은 `?category=` 검색 파라미터로 전달되고, 페이지는 `useOutletContext<OutletContext>()`로 수신

## 데이터 흐름

```
컴포넌트 → @tanstack/react-query (useQuery/useMutation)
        → src/lib/* fetcher (posts.ts, categories.ts, adminAuth.ts)
        → apiRequest (src/lib/api.ts)
        → REST API
```

- 모든 네트워크 요청은 `src/lib/api.ts`의 `apiRequest<T>(path, options)` 단일 경유 (직접 fetch 금지)
- API base URL: `import.meta.env.VITE_API_BASE_URL` (`DEFAULT_API_BASE_URL`). `.env`에서 `http://localhost:8080`
- 페이지 컴포넌트는 뷰 로직에 집중하고 데이터 접근은 lib/ 헬퍼로 위임

## 캐시 (src/lib/category-cache.ts)

- 카테고리 트리는 `staleTime: Infinity`로 무기한 캐시 (`useCategoryCache`)
- 어드민 카테고리 변경(생성/수정/삭제) 후 반드시 `useInvalidateCategoryCache()` 호출 (CategoryManager.tsx 패턴)
- `flattenCategories(tree)`로 중첩 트리를 평면 리스트로 변환

## 어드민 인증

- 토큰은 `window.localStorage["blog.admin.token"]`에 저장 (src/lib/adminAuth.ts)
- JWT는 클라이언트에서 디코드 (`parseAdminJwt`, `isAdminJwtUsable`, exp 30초 스큐)
- `RequireAuth`가 미인증 시 `/admin/login?from=...`으로 리다이렉트
- 어드민 API는 `Authorization: Bearer <token>` 헤더 사용

## 컨텐츠 렌더링

- 게시글 본문은 백엔드 HTML을 `dangerouslySetInnerHTML`로 렌더 (Post.tsx)
- 에디터는 Tiptap → HTML (`textEditor.tsx`)
- 상류(백엔드) 콘텐츠를 신뢰하는 구조. 렌더링 전 별도 정화(sanitize) 없음

## 설정 파일

- `vite.config.ts`: `@`, `@repo` alias
- `tsconfig.json`(references) / `tsconfig.app.json` / `tsconfig.node.json`
- `eslint.config.js`, `tailwind.config.js`, `components.json`
