---
name: publish-post
description: status가 reviewed인 블로그 글만 published로 바꾸고, 빌드로 sitemap과 RSS를 갱신한 뒤 PR을 준비한다. "발행해줘" 요청에 사용한다.
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
- `npm run build`를 실행한다. sitemap과 RSS는 빌드가 생성한다.
- `npm run check:html`을 실행한다. 이 스크립트는 Phase 1에서 만든다.
- 해당 글의 HTML에 title, description, canonical이 있는지 보고한다.

## 4. 소셜 게시 문구 (Phase 3 이후)
- `social/linkedin/<slug>.md`에 게시 문구 초안을 만든다.
  - 글 요약 2~3문장과 글 URL을 넣는다. 과장과 해시태그 남발은 하지 않는다.
- 이 파일은 PR에서 사람이 검수한다. 직접 게시하지 않는다. 게시는 merge 후 Action이 한다.

## 5. 커밋과 PR
- `publish/<slug>` 브랜치에 커밋한다.
- `create-pr` 스킬로 PR 초안을 보여 주고, 사용자가 승인하면 push하고 PR을 연다.
- merge와 배포는 사용자가 한다. merge가 곧 발행 승인이다.
