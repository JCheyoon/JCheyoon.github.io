---
paths:
  - "src/**"
---

# 렌더링·SEO 규칙

`src/` 아래 파일을 다룰 때 적용한다. 요구사항 전체는 `docs/SPEC.md` §7~8에 있다.

## 렌더링
- 색인 대상 페이지의 본문은 빌드 HTML에 들어 있어야 한다.
- 클라이언트에서 데이터를 받아 본문을 그리지 않는다.
- 아일랜드(`client:*` 지시어)는 SPEC §8에 적힌 것만 쓴다. 새로 필요하면 이유를 적어 제안한다.

## 메타와 링크
- 모든 페이지는 공통 SEO head 컴포넌트를 쓴다.
  고유 title, description, 절대 URL canonical, OG 태그가 들어간다.
- 페이지 이동은 `<a href>`로 한다. onClick 내비게이션은 쓰지 않는다.
- 사이트 이름, 작성자, URL은 `src/site.config.ts`에서만 읽는다. 하드코딩하지 않는다.

## 이미지
- 크기 지정과 alt는 필수다.
- 외부 이미지를 핫링크하지 않는다.

## 검증
- draft와 reviewed 글이 dist, sitemap, RSS에 들어가지 않는지 HTML 검사 스크립트로 확인한다.
