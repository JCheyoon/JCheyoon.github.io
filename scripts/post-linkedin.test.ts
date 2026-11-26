// LinkedIn 게시 대상 선정과 요청 내용 테스트(SPEC §9.3). LinkedIn은 호출하지 않는다.
// 실행: npm run test:linkedin
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkPosts, readPostSources } from "../src/lib/content-rules.ts";
import { articleUrl, ogImage, pendingPosts, shareBody } from "./post-linkedin.ts";

let root: string;

before(() => {
  root = mkdtempSync(join(tmpdir(), "blog-linkedin-test-"));
  mkdirSync(join(root, "src/content/posts/en"), { recursive: true });
  const sample = readFileSync(new URL("../src/content/posts/en/template-check-en.md", import.meta.url), "utf8");
  const write = (slug: string, status: string, extra: string) =>
    writeFileSync(
      join(root, "src/content/posts/en", `${slug}.md`),
      sample
        .replace("slug: template-check-en", `slug: ${slug}`)
        .replace("status: draft", `status: ${status}\n${extra}`)
        .replace(/^reviewed_at:.*$/m, "reviewed_at: 2026-11-26")
        .replace(/^reviewed_by:.*$/m, "reviewed_by: test")
        .replace(/^review_notes:.*$/m, "review_notes: test")
        .replace(/^published_at:.*$/m, "published_at: 2026-11-26"),
    );
  write("chosen", "published", "linkedin: true");
  write("custom-text", "published", "linkedin: true\nlinkedin_text: My own words");
  write("already-posted", "published", "linkedin: true");
  write("not-chosen", "published", "");
  write("still-draft", "draft", "linkedin: true");
});

after(() => rmSync(root, { recursive: true, force: true }));

test("published이고 linkedin: true이며 태그가 없는 영어 글만 올린다", () => {
  const slugs = pendingPosts(root, new Set(["linkedin/already-posted"])).map((p) => p.slug);
  assert.deepEqual(slugs.sort(), ["chosen", "custom-text"]);
});

test("문구는 linkedin_text, 없으면 제목과 description이고 글 주소가 붙는다", () => {
  for (const post of pendingPosts(root, new Set())) {
    const url = articleUrl("https://example.com/", post.slug);
    assert.equal(url, `https://example.com/en/post/${post.slug}/`);
    const content = shareBody(post, url, "abc", "https://example.com/a.png").specificContent["com.linkedin.ugc.ShareContent"];
    const text = post.linkedin_text ?? `${post.title}\n\n${post.description}`;
    assert.equal(content.shareCommentary.text, `${text}\n\n${url}`);
    assert.equal(content.media[0].originalUrl, url);
    assert.deepEqual(content.media[0].thumbnails, [{ url: "https://example.com/a.png" }]);
  }
});

test("대표 이미지는 글 페이지의 og:image다", () => {
  const html = '<meta property="og:title" content="t"><meta property="og:image" content="https://example.com/og/en/a.png">';
  assert.equal(ogImage(html), "https://example.com/og/en/a.png");
  assert.equal(ogImage("<html></html>"), undefined);
});

test("한국어 글에 linkedin: true를 쓰면 검사가 실패한다", () => {
  const raw = readFileSync(new URL("../src/content/posts/template-check.md", import.meta.url), "utf8").replace(
    "status: draft",
    "status: draft\nlinkedin: true",
  );
  const sources = readPostSources().map((s) => (s.path.endsWith("posts/template-check.md") ? { ...s, raw } : s));
  const { errors } = checkPosts(sources, { schema: true });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /LinkedIn에는 영어 글만/);
});
