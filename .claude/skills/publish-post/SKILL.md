---
name: publish-post
description: status가 reviewed인 블로그 글만 published로 바꾸고, 빌드로 sitemap과 RSS를 갱신한 뒤 PR을 준비한다. 원문이면 이어서 반대 언어 번역 초안을 만든다. "발행해줘" 요청에 사용한다.
---

# 발행

## 1. 사전 확인 (하나라도 실패하면 중단하고 이유를 보고한다)
- `status: reviewed`이고 `reviewed_at`, `reviewed_by`가 있다.
- 본문에 `[...필요]` 표시가 하나도 없다.
- 본문에 제휴 도메인 링크가 있으면 `disclosure`가 있다.
- 이번 주 발행이 3편 미만이다 (git log 기준).

## 2. 상태 변경
- `status: published`, `published_at`(오늘 날짜)을 기록한다.

## 3. 빌드와 검사
- `npm run verify`를 실행한다. sitemap과 RSS는 빌드가 생성하고, HTML 검사까지 한다.
- 해당 글의 HTML에 title, description, canonical이 있는지 보고한다.

## 4. 소셜 게시 문구 (Phase 4 이후)
- `social/linkedin/<slug>.md`에 게시 문구 초안을 만든다.
  - 글 요약 2~3문장과 글 URL을 넣는다. 과장과 해시태그 남발은 하지 않는다.
- 이 파일은 PR에서 사람이 검수한다. 직접 게시하지 않는다. 게시는 merge 후 Action이 한다.

## 5. 커밋과 PR
- `publish/<slug>` 브랜치에 커밋한다.
- `create-pr` 스킬로 PR 초안을 보여 주고, 사용자가 승인하면 push하고 PR을 연다.
- merge와 배포는 사용자가 한다. merge가 곧 발행 승인이다.

## 6. 번역 초안 (원문을 발행할 때만, SPEC §9.2)
발행한 글에 `translated_from`이 없으면(원문이면) 이어서 반대 언어 번역 초안을 만든다. 번역본을 발행할 때는 이 단계를 건너뛴다.
- `publish/<slug>`에서 `translate/<slug>` 브랜치를 만든다. 번역 도구는 published 원문만 받기 때문이다.
- 원문을 읽고 번역문을 쓴 뒤, 블로그 MCP 서버의 `translate_post`로 저장한다.
  - 제목, 요약, 대상 독자, 검색 의도, 본문을 번역해서 넘긴다. disclosure가 있으면 그것도 번역한다.
  - 사실, 수치, 코드, 출처 링크는 바꾸지 않는다. 원문에 없는 내용을 더하지 않는다.
  - 본문 이미지 경로는 번역본 위치 기준으로 고친다(영어 글은 `../../../assets/...`).
  - 거부되면 이유를 보여 주고 고친다.
- `check_post`로 확인하고 커밋한다.
- PR은 발행 PR이 merge된 뒤 `create-pr`로 연다. 그 전에 열면 발행 커밋이 섞인다.
- 번역본도 `review-post`로 검수하고, 승인 후 `publish-post`로 발행한다.
