// 글 컬렉션 정의. frontmatter 스키마와 상태 규칙은 src/lib/content-rules.ts에 있다(사이트·검사·MCP 서버 공통).
// 본문을 봐야 하는 검사(보완 표시, 제휴 링크, 이미지 alt, slug=파일명)는 scripts/check-content.ts가 한다.
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { postSchema } from "./lib/content-rules.ts";

const posts = defineCollection({
  loader: glob({
    // 한국어 글은 posts/<slug>.md, 영어 글은 posts/en/<slug>.md (SPEC §9.2)
    pattern: ["*.md", "en/*.md"],
    base: "./src/content/posts",
    // 글 id는 경로로 정한다(한국어 `<slug>`, 영어 `en/<slug>`). 원문과 번역본이 같은 slug를 써도 겹치지 않는다.
    // frontmatter slug가 파일명과 같은지, lang이 폴더와 맞는지는 check-content가 확인한다.
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  // 사이트 빌드에서는 cover 이미지를 Astro image()로 검사한다(실제 파일, 크기).
  schema: ({ image }) => postSchema(image()),
});

export const collections = { posts };
