// 블로그 MCP 서버 테스트(SPEC §9.4). 실제로 서버 프로세스를 stdio로 띄우고 MCP 클라이언트로 도구를 부른다.
// 글은 저장소의 샘플을 임시 폴더에 복사해서 쓴다(BLOG_ROOT). 저장소 파일은 건드리지 않는다.
// 실행: npm run test:mcp
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const REPO = fileURLToPath(new URL("..", import.meta.url));
const POSTS = "src/content/posts";
const TEMPLATES = "src/content/templates";

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
  cpSync(join(REPO, TEMPLATES), join(root, TEMPLATES), { recursive: true });
  cpSync(join(REPO, "src/assets/posts"), join(root, "src/assets/posts"), { recursive: true });

  // 번역할 수 있는 published 원문: 하나는 그대로, 하나는 disclosure가 있는 글
  const published = (slug: string, extra = "") =>
    readFileSync(join(root, POSTS, "template-check.md"), "utf8")
      .replace("slug: template-check", `slug: ${slug}`)
      .replace("status: draft", "status: published")
      .replace(/^reviewed_at:$/m, "reviewed_at: 2026-11-25")
      .replace(/^reviewed_by:$/m, "reviewed_by: test")
      .replace(/^review_notes:$/m, "review_notes: test")
      .replace(/^published_at:$/m, "published_at: 2026-11-25")
      .replace(/^disclosure:$/m, `disclosure:${extra}`);
  writeFileSync(join(root, POSTS, "pub-post.md"), published("pub-post"));
  writeFileSync(join(root, POSTS, "pub-image.md"), published("pub-image"));
  writeFileSync(join(root, POSTS, "pub-affiliate.md"), published("pub-affiliate", " 이 글의 링크로 구매하면 작성자가 수수료를 받습니다."));

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
    assert.deepEqual(published.map((p: any) => p.slug).sort(), ["broken-post", "pub-affiliate", "pub-image", "pub-post"]);
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

describe("list_templates", () => {
  test("기본 템플릿 4개와 선택 블록 2개를 언제 쓰는지와 함께 돌려준다", async () => {
    const { data } = await call("list_templates");
    const names = (kind: string) => data.filter((t: any) => t.kind === kind).map((t: any) => t.name).sort();
    assert.deepEqual(names("base"), ["devlog", "implementation", "measurement", "summary"]);
    assert.deepEqual(names("option"), ["bugfix", "troubleshooting"]);
    assert.ok(data.every((t: any) => t.when.length > 0 && t.body.length > 0));
  });
});

describe("create_draft", () => {
  const draft = {
    slug: "new-draft",
    title: "새 초안",
    description: "create_draft 테스트용 초안",
    category: "etc",
    audience: "테스트",
    search_intent: "테스트",
  };
  const read = (path: string) => readFileSync(join(root, path), "utf8");

  test("템플릿과 선택 블록으로 초안을 만들고, draft·ai_assisted를 강제한다", async () => {
    // status를 넘겨도 입력 스키마에 없는 값이라 무시된다
    const { isError, data } = await call("create_draft", { ...draft, template: "devlog", options: ["bugfix"], status: "published" });
    assert.equal(isError, false, JSON.stringify(data));
    assert.equal(data.path, `${POSTS}/new-draft.md`);
    const text = read(data.path);
    assert.match(text, /^status: draft$/m);
    assert.match(text, /^ai_assisted: true$/m);
    assert.match(text, /^lang: ko$/m);
    assert.match(text, /^created_at: \d{4}-\d{2}-\d{2}$/m);
    assert.match(text, /^reviewed_at:$/m);
    assert.match(text, /## 막힌 점/);
    assert.match(text, /## 버그 해결/);
    const { data: check } = await call("check_post", { slug: "new-draft" });
    assert.equal(check.ok, true, check.errors.join("\n"));
  });

  test("영어 원문은 posts/en/에 만든다", async () => {
    const { data } = await call("create_draft", { ...draft, slug: "english-draft", lang: "en", body: "An English original." });
    assert.equal(data.path, `${POSTS}/en/english-draft.md`);
    assert.match(read(data.path), /^lang: en$/m);
  });

  const rejects = async (args: Record<string, unknown>, pattern: RegExp, path: string) => {
    const { isError, data } = await call("create_draft", { ...draft, ...args });
    assert.equal(isError, true);
    assert.match(data.errors.join("\n"), pattern);
    assert.equal(existsSync(join(root, path)), false, `${path}가 만들어지면 안 된다`);
  };

  test("같은 언어에 같은 slug가 있으면 거부한다", async () => {
    const before = read(`${POSTS}/template-check.md`);
    const { isError } = await call("create_draft", { ...draft, slug: "template-check", body: "덮어쓰기" });
    assert.equal(isError, true);
    assert.equal(read(`${POSTS}/template-check.md`), before);
  });

  test("반대 언어에 같은 slug의 원문이 있으면 거부한다(번역은 translate_post)", () =>
    rejects({ slug: "template-check-en", body: "본문" }, /translated_from이 없다/, `${POSTS}/template-check-en.md`));

  test("slug 형식이 틀리면 거부한다", () => rejects({ slug: "Bad_Slug", body: "본문" }, /slug/, `${POSTS}/Bad_Slug.md`));

  test("없는 템플릿이나 선택 블록이면 거부한다", async () => {
    await rejects({ slug: "t1", template: "nope" }, /기본 템플릿 nope/, `${POSTS}/t1.md`);
    await rejects({ slug: "t2", template: "devlog", options: ["nope"] }, /선택 블록 nope/, `${POSTS}/t2.md`);
    await rejects({ slug: "t3", template: "bugfix" }, /기본 템플릿 bugfix/, `${POSTS}/t3.md`);
  });

  test("본문도 템플릿도 없으면 거부한다", () => rejects({ slug: "t4" }, /body나 template/, `${POSTS}/t4.md`));
});

describe("translate_post", () => {
  const translation = {
    from: "ko",
    title: "Published post",
    description: "A translated description",
    audience: "Test readers",
    search_intent: "Testing translation drafts",
    body: "This is the translated body.",
  };
  const read = (path: string) => readFileSync(join(root, path), "utf8");
  const rejects = async (args: Record<string, unknown>, pattern: RegExp) => {
    const { isError, data } = await call("translate_post", { ...translation, ...args });
    assert.equal(isError, true, JSON.stringify(data));
    assert.match(data.errors.join("\n"), pattern);
  };

  test("published 원문의 번역 초안을 반대 언어 폴더에 만들고 frontmatter를 고정한다", async () => {
    const { isError, data } = await call("translate_post", { ...translation, slug: "pub-post" });
    assert.equal(isError, false, JSON.stringify(data));
    assert.equal(data.path, `${POSTS}/en/pub-post.md`);
    const text = read(data.path);
    for (const line of ["status: draft", "lang: en", "translated_from: ko", "ai_assisted: true", "category: etc", "title: Published post"]) {
      assert.match(text, new RegExp(`^${line}$`, "m"));
    }
    const { data: check } = await call("check_post", { slug: "pub-post", lang: "en" });
    assert.equal(check.ok, true, check.errors.join("\n"));
    const { data: list } = await call("list_posts", { lang: "ko" });
    assert.equal(list.find((p: any) => p.slug === "pub-post").has_counterpart, true);
  });

  test("번역본이 이미 있으면 거부한다", () => rejects({ slug: "pub-post" }, /이미 있다/));
  test("원문이 published가 아니면 거부한다", () => rejects({ slug: "template-check" }, /published 원문만/));
  test("번역본을 다시 번역하지 않는다", () => rejects({ slug: "template-check", from: "en" }, /번역본이다/));
  test("원문이 없으면 거부한다", () => rejects({ slug: "no-such-post" }, /원문 no-such-post가 없다/));
  test("원문에 disclosure가 있으면 번역한 문구가 필요하다", () =>
    rejects({ slug: "pub-affiliate" }, /disclosure/));

  test("본문 이미지 경로가 번역본 위치에서 보이지 않으면 바른 경로를 알려 주고 거부한다", async () => {
    const img = (path: string) => `![Site icon](${path}/assets/posts/template-check/sample-icon.png)`;
    await rejects({ slug: "pub-image", body: img("../..") }, /\.\.\/\.\.\/\.\.\/assets/);
    assert.equal(existsSync(join(root, POSTS, "en/pub-image.md")), false);
    const { isError, data } = await call("translate_post", { ...translation, slug: "pub-image", body: img("../../..") });
    assert.equal(isError, false, JSON.stringify(data));
  });
});
