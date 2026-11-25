#!/usr/bin/env node
// 블로그 MCP 서버(SPEC §9.4, D10). 로컬 stdio로만 실행한다. 실행: npm run mcp
//
// 하지 않는 것: commit, push, PR 생성, status를 reviewed·published로 바꾸기.
// 이것들은 사용자 승인 절차(create-pr, publish-post)를 따른다.
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "astro/zod";
import { LANGS } from "../src/i18n.ts";
import { checkPost, listPosts } from "./tools.ts";

// 저장소 루트. 서버를 어디서 실행해도 이 저장소의 글을 다룬다.
// BLOG_ROOT는 테스트가 임시 폴더의 글로 서버를 돌릴 때만 쓴다.
const ROOT = process.env.BLOG_ROOT ?? fileURLToPath(new URL("..", import.meta.url));

const json = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
});

const server = new McpServer({ name: "cheyoon-blog", version: "0.1.0" });

server.registerTool(
  "list_posts",
  {
    title: "글 목록",
    description:
      "블로그 글 목록을 돌려준다. 각 글의 slug, 언어, 제목, 상태(draft/reviewed/published), 카테고리, 번역본 여부, 반대 언어 짝이 있는지를 담는다.",
    inputSchema: z.object({
      lang: z.enum(LANGS).optional().describe("ko 또는 en. 생략하면 두 언어 모두"),
      status: z.enum(["draft", "reviewed", "published"]).optional().describe("생략하면 모든 상태"),
    }),
    annotations: { readOnlyHint: true },
  },
  async ({ lang, status }) => json(listPosts(ROOT, { lang, status })),
);

server.registerTool(
  "check_post",
  {
    title: "글 검사",
    description:
      "글 한 편을 콘텐츠 규칙(SPEC §5.2)으로 검사한다. frontmatter 스키마, slug, 언어 폴더, 번역 관계, 보완 표시, 제휴 표시, 이미지 alt를 본다. errors가 비어 있어야 검수·발행할 수 있다.",
    inputSchema: z.object({
      slug: z.string().describe("글 slug (파일명)"),
      lang: z.enum(LANGS).default("ko").describe("글의 언어. 영어 글은 en"),
    }),
    annotations: { readOnlyHint: true },
  },
  async ({ slug, lang }) => {
    const result = checkPost(ROOT, slug, lang);
    if (!result) return { ...json({ error: `${lang} 글 ${slug}가 없다` }), isError: true };
    return json(result);
  },
);

await server.connect(new StdioServerTransport());
