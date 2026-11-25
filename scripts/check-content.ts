#!/usr/bin/env node
// 본문까지 봐야 하는 콘텐츠 검사(SPEC §5.2). 규칙은 src/lib/content-rules.ts에 있다.
// frontmatter 필드와 상태별 필수값은 사이트 빌드가 같은 스키마로 검사한다.
//
// reviewed·published 글은 문제가 있으면 실패(exit 1), draft 글은 경고만 낸다.
import { checkPosts, readPostSources } from "../src/lib/content-rules.ts";

const sources = readPostSources();
const { errors, warnings } = checkPosts(sources);

for (const w of warnings) console.warn(`경고  ${w}`);
for (const e of errors) console.error(`오류  ${e}`);
console.log(`check-content: 글 ${sources.length}편, 오류 ${errors.length}, 경고 ${warnings.length}`);
process.exit(errors.length > 0 ? 1 : 0);
