---
name: create-pr
description: 현재 작업 브랜치의 PR 초안(한글 제목·설명)을 만들어 사용자에게 보여 주고, 사용자가 명시적으로 승인한 뒤에만 push하고 master 대상 PR을 연다. 승인 없이는 push하지 않는다. "PR 올려줘", "PR 만들어줘", "push하고 PR" 요청과 publish-post 마지막 단계에서 사용한다.
---

# PR 자동 작성

PR 제목과 설명은 한글로 쓴다. 코드 식별자, 경로, 명령어는 원문 그대로 둔다.

## 1. 사전 확인 (하나라도 실패하면 중단하고 이유를 보고한다)

- 현재 브랜치가 `master`가 아니다.
- 이 PR이 따로 열 만한 변경인지 확인한다(`project-scope.md`의 "PR을 따로 열지 않는 변경"). 문서 상태만 바꾸는 변경이면 멈추고, 다음 작업 브랜치에 합치자고 제안한다.
- `git status`에 커밋하지 않은 변경이 없다. 있으면 멈추고 사용자에게 묻는다.
- `git fetch origin`을 한 뒤, `git log origin/master..HEAD`에 커밋이 1개 이상 있다.
- 커밋 메시지에 AI 작성 표시가 없다.
  - 확인: `git log origin/master..HEAD --format=%B | grep -iE 'co-authored-by: *claude|generated with'`
  - 있으면 멈추고 알린다. 히스토리를 고칠지는 사용자가 정한다.

## 2. 검증

- 변경 파일 목록: `git diff --name-only origin/master...HEAD`
- `.md` 파일만 바뀌었으면 검증을 생략하고, 생략했다는 사실을 PR에 적는다.
- 코드가 바뀌었으면 현재 단계의 검증을 실행한다.
  - Phase 1 이후: `astro check`, build, HTML 검사 스크립트
  - 레거시 SPA(`src/` 또는 `legacy/spa/`)는 원래 빌드가 실패하므로 검증하지 않는다. 그 사실을 PR에 적는다.
- 검증이 실패하면 PR을 열지 않고 보고한다.

## 3. 제목

- 한글 한 줄, 50자 안팎.
- 형식: `<범위>: <무엇을 했는지>`. 예: `docs: Astro 이전 SPEC과 로드맵 추가`

## 4. 본문

`.github/pull_request_template.md`가 있으면 그 양식을 따른다. 없으면 아래 양식을 쓴다.

```markdown
## 요약
(2~3문장. 무엇을, 왜 바꿨는지)

## 변경 내용
| 커밋 | 무엇을 | 왜 |
|---|---|---|
(커밋마다 한 줄. `git log --reverse origin/master..HEAD`와 `git show --stat <커밋>`을 보고 쓴다)

## 영향 범위
- 라이브 사이트·배포: (Pages 설정, 배포 워크플로를 건드렸는지)
- 코드: (바뀐 코드 경로. 없으면 "문서만 변경")
- 데이터·URL: (slug나 URL이 바뀌는지)

## 확인한 것 / 확인하지 못한 것
- 확인: (실제로 실행한 검증과 결과)
- 미확인: (없으면 "없음")

## merge 전 확인할 것
- (리뷰어가 직접 봐야 할 것)

관련 문서: docs/SPEC.md §…, docs/ROADMAP.md Phase …
```

작성 원칙:
- 사실만 쓴다. 실행하지 않은 검증을 "통과"라고 쓰지 않는다.
- AI 작성 표시를 넣지 않는다. 예: `Co-Authored-By: Claude`, "Generated with Claude Code", 🤖

## 5. 사용자 확인 (생략 불가)

push, PR 생성, PR 수정 전에는 반드시 사용자에게 아래 내용을 보여 주고 답을 기다린다.

- 브랜치 → base, 커밋 목록, 변경 파일 목록
- PR 제목과 본문 전문
- 실행할 명령 (`git push`, `gh pr create` 또는 `gh pr edit`)

판단 기준:
- 사용자가 이 초안을 보고 "올려", "응"처럼 명시적으로 승인했을 때만 6단계로 넘어간다.
- 앞선 대화에서 작업 자체를 승인받았더라도("해줘" 등) push나 PR을 승인한 것으로 보지 않는다. 중간에 작업 범위가 바뀌었다면 더욱 그렇다.
- 사용자가 고쳐 달라고 하면, 반영한 초안을 다시 보여 주고 다시 승인을 받는다.
- 이미 열린 PR의 제목이나 본문을 고칠 때도 같은 절차를 거친다.

## 6. push와 PR (승인 후에만)

1. `git push -u origin <브랜치>`
   - force push 하지 않는다.
   - `master`로 push 하지 않는다.
2. 본문을 임시 파일에 저장한다.
3. PR을 연다.
   - 같은 브랜치에 열린 PR이 없으면: `gh pr create --base master --head <브랜치> --title "<제목>" --body-file <파일>`
   - 이미 있으면: `gh pr edit <번호> --title "<제목>" --body-file <파일>`

## 7. 하지 않는 것

다음은 사용자가 한다.
- merge, 리뷰 승인, 브랜치 삭제
- 배포
- GitHub Pages 설정 변경

## 출력

- 승인 전: 5단계 확인용 초안. 여기서 멈추고 답을 기다린다.
- 승인 후: PR URL과 제목, merge 전에 사용자가 확인할 것
