---
title: "템플릿 검증용 샘플 글"
slug: template-check
description: "글 페이지 템플릿(제목, 본문 스타일, 이미지, 표, 코드, 출처, 이전·다음 글)을 확인하기 위한 샘플입니다. 배포되지 않습니다."
category: etc
tags: [sample]
status: draft
ai_assisted: true
audience: "블로그 템플릿을 확인하는 운영자"
search_intent: "해당 없음 (배포되지 않는 검증용 글)"
created_at: 2026-11-23
reviewed_at:
reviewed_by:
review_notes:
published_at:
updated_at:
disclosure:
sources:
  - title: "Astro 문서"
    url: "https://docs.astro.build/"
    accessed: 2026-11-23
---

이 글은 Phase 1에서 글 페이지 템플릿을 확인하려고 만든 샘플입니다. `status: draft`이므로 배포 빌드에는 들어가지 않고, 개발 서버(`npm run dev`)와 템플릿 검증 빌드(`INCLUDE_DRAFTS=true`)에서만 보입니다. scripts/check-content.ts가 이 파일이 draft 상태인지 확인합니다.

## 소제목과 문단

본문 스타일은 Tailwind typography(`prose`)로 입힙니다. 한국어 문장이 단어 중간에서 끊기지 않도록 `word-break: keep-all`을 적용했습니다.

### 목록

- 순서 없는 목록 첫째 항목
- 둘째 항목
  - 하위 항목

1. 순서 있는 목록
2. 둘째 단계

## 인용과 링크

> 인용문 스타일을 확인하기 위한 문단입니다.

외부 링크 예시: [Astro 문서](https://docs.astro.build/)

## 코드

```ts
export function postUrl(slug: string): string {
  return `/post/${slug}/`;
}
```

## 표

| 항목 | 값 |
|---|---|
| 주소 형식 | `/post/slug/` |
| 공개 조건 | `status: published` |

## 이미지

![사이트 아이콘: 흰 바탕에 '채윤' 글자, '채'의 첫 획은 청록색](../../assets/posts/template-check/sample-icon.png)
