# API 규칙

`src/lib/api.ts` 중심의 네트워크 계층 규칙.

## 진입점

- 모든 요청은 `apiRequest<T>(path, options)` 사용. 직접 `fetch` 호출 금지
- base URL: `VITE_API_BASE_URL` (`DEFAULT_API_BASE_URL`). 미설정 시 빈 문자열 = 동일 오리진. trailing slash는 제거됨

## 요청 작성법

- JSON body: 객체를 넘기면 자동 `JSON.stringify` + `Content-Type: application/json`
- FormData/Blob/string은 그대로 전달
- 쿼리 파라미터: `options.query` 객체 사용 (`buildUrl`이 URLSearchParams로 직렬화).
  `posts.ts`의 `fetchPosts`는 수동 URLSearchParams로도 작성되어 있음 (두 방식 공존)
- 에러: 비-2xx 응답은 `ApiError { status, body }` throw. 응답 본문이 비면 `undefined` 반환

## 엔드포인트 (코드에서 확인)

| 메서드          | 경로                          | 인증   | 용도                            |
| --------------- | ----------------------------- | ------ | ------------------------------- |
| GET             | `/api/posts?tag&category`     | 공개   | 목록 조회 (fetchPosts)          |
| GET             | `/api/posts?all=true`         | 어드민 | 전체+초안 조회 (fetchAllPosts)  |
| GET             | `/api/posts/:slug`            | 공개   | 단일 조회 (fetchPostBySlug)     |
| GET             | `/api/admin/posts/:id`        | Bearer | 편집용 조회 (fetchPost)         |
| POST            | `/api/posts`                  | Bearer | 생성 (createAdminPost)          |
| PUT             | `/api/posts/:id`              | Bearer | 수정 (updatePost)               |
| DELETE          | `/api/posts/:id`              | Bearer | 삭제 (deletePost)               |
| POST            | `/api/auth/login`             | -      | 로그인 (loginAdmin)             |
| GET             | `/api/categories`             | 공개   | 중첩 트리 (fetchCategoryTree)   |
| GET             | `/api/admin/categories`       | Bearer | 평면 목록 (fetchFlatCategories) |
| POST/PUT/DELETE | `/api/admin/categories(/:id)` | Bearer | 카테고리 CRUD                   |

## 관례

- 공개 목록 fetcher는 `data ?? []`로 빈 배열 보장 (posts.ts, categories.ts)
- 어드민 요청 헤더: `Authorization: Bearer ${token}` — token은 `useAdminAuth()`에서 획득
- 카테고리 데이터는 항상 `src/lib/category-cache.ts` 경유 (직접 fetch 지양)
- 어드민 카테고리 변경 후 `useInvalidateCategoryCache()` 호출 필수
