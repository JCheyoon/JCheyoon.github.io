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
import { categorySlugs } from "../src/data/categories.ts";
import { checkPost, createDraft, listPosts, listTemplates, translatePost, type WriteResult } from "./tools.ts";

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

/** 쓰기 도구의 결과. 거부되면 isError로 이유를 돌려준다. */
const written = (result: WriteResult) => (result.ok ? json(result) : { ...json(result), isError: true });

server.registerTool(
  "list_templates",
  {
    title: "글 템플릿 목록",
    description:
      "글 템플릿(SPEC §5.7)과 각각 언제 쓰는지, 본문 뼈대를 돌려준다. kind가 base인 것 중 하나를 고르고, 필요하면 kind가 option인 선택 블록(트러블슈팅, 버그 해결)을 붙인다. 주제와 작성자 메모를 when과 비교해 템플릿을 제안하고, 작성자 확인을 받은 뒤 create_draft에 넘긴다.",
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => json(listTemplates(ROOT)),
);

server.registerTool(
  "create_draft",
  {
    title: "초안 만들기",
    description:
      "새 원문 초안 파일을 만든다. status는 항상 draft, ai_assisted는 항상 true로 기록된다. body를 주면 그 본문을, 없으면 template(+options)의 뼈대를 넣는다. 경험이 필요한 자리는 [경험 추가 필요: …], 출처 링크는 틀리면 글의 결론이 흔들리거나 독자가 잘못 결정할 문장(수치, 가격, 바뀔 수 있는 정책, 결론이 걸린 도구 동작, 인용)에만 달고 한 문서는 한 번만 링크한다. 필요한데 출처가 없으면 [출처 확인 필요]로 남긴다. 같은 slug의 글이 있거나 규칙에 어긋나면 파일을 만들지 않고 이유를 돌려준다. 번역본은 translate_post로 만든다.",
    inputSchema: z.object({
      slug: z.string().describe("영문 소문자, 숫자, 하이픈. 파일명과 주소가 된다"),
      lang: z.enum(LANGS).default("ko").describe("원문 언어"),
      title: z.string().describe("본문과 일치하고 과장하지 않는 제목"),
      description: z.string().describe("검색 결과와 OG에 쓰는 요약"),
      category: z.enum(categorySlugs),
      tags: z.array(z.string()).optional().describe("영문 소문자, 숫자, 하이픈만(D13). 태그 주소 /tag/<tag>/가 된다. 예: astro, github-actions"),
      audience: z.string().describe("대상 독자"),
      search_intent: z.string().describe("검색 의도 한 문장"),
      body: z.string().optional().describe("작성한 본문(Markdown, frontmatter 제외)"),
      template: z.string().optional().describe("기본 템플릿 이름 (list_templates의 name, kind: base)"),
      options: z.array(z.string()).optional().describe("선택 블록 이름 (kind: option)"),
    }),
  },
  async (input) => written(createDraft(ROOT, input)),
);

server.registerTool(
  "translate_post",
  {
    title: "번역 초안 만들기",
    description:
      "published 원문 1편의 번역 초안을 반대 언어(ko↔en)로 만든다(SPEC §9.2). 번역문은 호출하는 쪽이 원문을 읽고 직접 써서 넘긴다. 영어로 번역할 때의 문체: (1) CEFR B2 이하의 읽기 쉬운 미국식 영어로 쓴다. 개발자가 쓰는 기술 용어(hydration, static export 등)는 이 기준의 예외이며 쉬운 말로 바꾸지 않는다. (2) 한국어에만 통하는 표현은 직역하지 않고 뜻이 같은 영어 표현으로 바꾼다. (3) 원문의 인칭을 유지하고(1인칭은 1인칭으로) 개인적이고 편한 말투를 살린다. (4) 확신의 정도를 유지한다. 추측을 단정으로, 의견을 사실로 바꾸지 않는다. (5) 제목과 description은 직역하지 않고 영어 검색어에 맞게 자연스럽게 쓰되 뜻과 주장은 바꾸지 않는다. (6) delve, game-changer, seamless 같은 과장되거나 AI 특유의 표현을 쓰지 않는다. (7) 한국 독자만 아는 이름이나 맥락은 처음 나올 때 짧게 설명한다. 원문에 없는 내용은 이 설명만 더할 수 있다. (8) 번역하기 전에 docs/translation-glossary.md를 읽고, 거기 있는 표현을 먼저 쓴다. (9) 한국어의 문장 구조와 표현을 따라가지 않는다. 처음부터 영어로 쓴다면 어떻게 말할지를 기준으로, 필요하면 문장을 새로 짠다. 관용 표현에 맞는 영어가 없으면 억지로 만들지 말고 평범한 말로 쓴다. (10) 저장하기 전에 영어 글만 따로 읽으며 번역 투를 고친다. 저장한 뒤 뜻으로 옮긴 표현과 더한 설명을 원문과 나란히 목록으로 사용자에게 알려 준다. 표현집에 없는 표현은 후보 2~3개와 말투 차이를 함께 보여 주고 고르게 하며, 고른 것은 표현집에 기록한다. 도구는 원문이 published인지, 번역본이 이미 있는지 확인하고, status: draft·ai_assisted: true·translated_from을 고정한다. category, tags, sources, cover는 원문에서 가져온다. 원문에 disclosure가 있으면 번역한 문구가 필요하다. 본문 이미지 상대 경로는 번역본 위치 기준이어야 한다(posts/en/은 한 단계 더 깊다). 번역본도 검수 후에만 발행한다.",
    inputSchema: z.object({
      slug: z.string().describe("원문 slug. 번역본도 같은 slug를 쓴다"),
      from: z.enum(LANGS).default("ko").describe("원문 언어"),
      title: z.string().describe("번역한 제목"),
      description: z.string().describe("번역한 요약"),
      audience: z.string().describe("번역한 대상 독자"),
      search_intent: z.string().describe("번역한 검색 의도"),
      body: z.string().describe("번역한 본문(Markdown, frontmatter 제외)"),
      disclosure: z.string().optional().describe("원문에 disclosure가 있을 때 번역한 문구"),
    }),
  },
  async (input) => written(translatePost(ROOT, input)),
);

await server.connect(new StdioServerTransport());
