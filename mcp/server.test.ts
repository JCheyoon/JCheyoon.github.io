// 블로그 MCP 서버 테스트(SPEC §9.4). 실제로 서버 프로세스를 stdio로 띄우고 MCP 클라이언트로 도구를 부른다.
// 글은 저장소의 샘플을 임시 폴더에 복사해서 쓴다(BLOG_ROOT). 저장소 파일은 건드리지 않는다.
// 실행: npm run test:mcp
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const REPO = fileURLToPath(new URL("..", import.meta.url));
const POSTS = "src/content/posts";

let root: string;
let client: Client;

/** 도구를 부르고 JSON 결과를 돌려준다 */
async function call(name: string, args: Record<string, unknown> = {}) {
  const result = await client.callTool({ name, arguments: args });
  const text = result.content.find((c) => c.type === "text")?.text ?? "";
  return { isError: Boolean(result.isError), data: JSON.parse(text) };
}

before(async () => {
  root = mkdtempSync(join(tmpdir(), "blog-mcp-test-"));
  cpSync(join(REPO, POSTS), join(root, POSTS), { recursive: true });

  // 검사가 잡아야 하는 글: published인데 검수 기록과 발행일이 없고, 보완 표시가 남아 있다
  const bad = readFileSync(join(root, POSTS, "template-check.md"), "utf8")
    .replace("slug: template-check", "slug: broken-post")
    .replace("status: draft", "status: published")
    .concat("\n[경험 추가 필요: 측정값]\n");
  writeFileSync(join(root, POSTS, "broken-post.md"), bad);

  client = new Client({ name: "blog-mcp-test", version: "0.0.0" });
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [join(REPO, "mcp/server.ts")],
      env: { ...process.env, BLOG_ROOT: root } as Record<string, string>,
      stderr: "inherit",
    }),
  );
});

after(async () => {
  await client?.close();
  rmSync(root, { recursive: true, force: true });
});

describe("list_posts", () => {
  test("두 언어의 글과 번역 짝 여부를 돌려준다", async () => {
    const { data } = await call("list_posts");
    const ko = data.find((p: any) => p.lang === "ko" && p.slug === "template-check");
    const en = data.find((p: any) => p.lang === "en" && p.slug === "template-check");
    const enOriginal = data.find((p: any) => p.slug === "template-check-en");
    assert.equal(ko.has_counterpart, true);
    assert.equal(en.translated_from, "ko");
    assert.equal(enOriginal.has_counterpart, false);
  });

  test("언어와 상태로 거른다", async () => {
    const { data: en } = await call("list_posts", { lang: "en" });
    assert.ok(en.length > 0 && en.every((p: any) => p.lang === "en"));
    const { data: published } = await call("list_posts", { status: "published" });
    assert.deepEqual(
      published.map((p: any) => p.slug),
      ["broken-post"],
    );
  });
});

describe("check_post", () => {
  test("규칙을 지킨 글은 ok", async () => {
    const { data } = await call("check_post", { slug: "template-check", lang: "en" });
    assert.equal(data.ok, true);
    assert.deepEqual(data.errors, []);
  });

  test("스키마와 본문 규칙 위반을 빌드 없이 알려 준다", async () => {
    const { data } = await call("check_post", { slug: "broken-post" });
    assert.equal(data.ok, false);
    const all = data.errors.join("\n");
    assert.match(all, /reviewed_at가 필요하다/);
    assert.match(all, /published_at이 필요하다/);
    assert.match(all, /경험 추가 필요/);
  });

  test("없는 글이면 오류로 답한다", async () => {
    const { isError, data } = await call("check_post", { slug: "no-such-post" });
    assert.equal(isError, true);
    assert.match(data.error, /no-such-post/);
  });
});
