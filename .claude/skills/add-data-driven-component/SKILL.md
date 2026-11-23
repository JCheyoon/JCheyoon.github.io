---
name: add-data-driven-component
description: [레거시 SPA 전용 — Phase 1 이후 새 코드에는 쓰지 않는다] react-query로 서버 데이터를 불러오는 페이지/컴포넌트 추가. 목록·상세·어드민 화면에 사용.
---

# 데이터 연동 컴포넌트 추가

## 목적

`Home.tsx`, `Post.tsx`, `AdminDashboard.tsx` 패턴대로 react-query를 쓰는 화면 컴포넌트를 만든다.

## 트리거

- 새 공개 페이지/라우트 추가
- 목록·상세·어드민 화면에 서버 데이터 표시
- 기존 화면에 데이터 소스를 추가

## 절차

1. 라우트가 필요하면 `src/App.tsx`에 `Route` 등록:
   - 공개: `Root` 하위 (`/`, `/about`, `/archive`, `/portfolio`, `/post/:slug` 형태)
   - 어드민: `RequireAuth` → `AdminLayout` 하위
2. `useQuery({ queryKey, queryFn, enabled, staleTime })` 사용:
   - queryKey: `["posts", filter]` / `["post", slug]` / `["admin", ...]` 형태 (naming-convention 참고)
   - queryFn은 `src/lib/` fetcher 호출
   - 파라미터 의존 query는 `enabled` 조건 사용 (예: `enabled: !!slug`)
3. 로딩/에러 상태 처리 (`isLoading`, `error` → 폴백 UI. Post.tsx 참고)
4. 카테고리 연동 시 `useCategoryCache()` 사용, 선택 카테고리는 `useOutletContext<OutletContext>()` 또는 `?category=` 파라미터로 전달
5. 어드민 화면: `useAdminAuth()`로 token 획득, mutation 후 `queryClient.invalidateQueries`로 갱신
6. 카테고리 변경 mutation 후에는 `useInvalidateCategoryCache()` 호출

## 참고

- `staleTime` 기본 0. Home은 30_000 사용, 카테고리 캐시는 Infinity
- mutation은 `useMutation({ mutationFn, onSuccess })` 패턴 (CategoryManager.tsx 참고)

## 체크리스트

- [ ] queryKey가 기존 규칙과 일치
- [ ] 로딩/에러 UI 존재
- [ ] 어드민 mutation 후 쿼리/캐시 갱신
