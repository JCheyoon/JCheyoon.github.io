---
name: add-api-fetcher
description: [레거시 SPA 전용 — Phase 1 이후 새 코드에는 쓰지 않는다] src/lib에 API 호출 함수(읽기/쓰기) 추가. 새 백엔드 엔드포인트가 필요할 때 사용.
---

# API fetcher 추가

## 목적

`src/lib/posts.ts` / `categories.ts` / `adminAuth.ts` 스타일의 API 함수를 일관되게 추가한다.
모든 요청은 `src/lib/api.ts`의 `apiRequest`를 경유한다.

## 트리거

- 새 백엔드 엔드포인트를 호출해야 할 때
- 기존 엔드포인트에 옵션(쿼리 파라미터, 인증)이 추가될 때
- 어드민에서 데이터를 변경하는 기능(생성/수정/삭제) 추가 시

## 절차

1. 대상 파일 결정: 게시글 → `src/lib/posts.ts`, 카테고리 → `src/lib/categories.ts`, 인증 → `src/lib/adminAuth.ts`
2. 시그니처 규칙 준수:
   - 읽기: `fetch<대상>(...)` → `Promise<T>`. 목록은 `data ?? []`로 빈 배열 보장
   - 쓰기: `<동사><대상>(payload, token)` — `token`은 마지막 파라미터, `Authorization: Bearer ${token}` 헤더
3. `apiRequest<T>(path, { method, headers, body, query })` 사용:
   - JSON body는 객체 그대로, 쿼리는 `query` 객체로
4. 반환 타입은 `src/types/types.ts`의 `Post`/`Category` 또는 신규 타입 정의
5. 테스트 스크립트가 없으므로 `npm run build`로 타입 검증

## 예시 (categories.ts 패턴)

```ts
export async function createCategory(
  body: { name: string; parentId?: number | null },
  token: string,
): Promise<Category> {
  return apiRequest<Category>("/api/admin/categories", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
}
```

## 체크리스트

- [ ] `apiRequest` 경유 (직접 fetch 금지)
- [ ] 어드민 함수에 Bearer 토큰 헤더
- [ ] 카테고리 변경 시 캐시 무효화 (`useInvalidateCategoryCache`)
