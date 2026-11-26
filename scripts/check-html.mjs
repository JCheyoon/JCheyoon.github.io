#!/usr/bin/env node
// 빌드 결과물 HTML 검사(SPEC §7, §10).
//
// 사용법:
//   node scripts/check-html.mjs dist            배포 빌드: 초안이 새지 않았는지까지 확인
//   node scripts/check-html.mjs dist-drafts --drafts
//                                              템플릿 검증 빌드: 글 페이지가 1개 이상 있어야 한다
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { parse } from "yaml";

const args = process.argv.slice(2);
const DIR = args.find((a) => !a.startsWith("--")) ?? "dist";
const DRAFTS_MODE = args.includes("--drafts");
const POSTS_DIR = "src/content/posts";
const MIN_ARTICLE_TEXT = 200;

const errors = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);

if (!existsSync(DIR)) {
  console.error(`check-html: ${DIR}가 없다. 먼저 빌드한다.`);
  process.exit(1);
}

for (const required of ["index.html", "404.html", "rss.xml", "robots.txt", "sitemap-index.xml", "en/index.html", "en/rss.xml", "data/posts.json"]) {
  if (!existsSync(join(DIR, required))) fail(DIR, `${required}가 없다`);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((m) => attrs(m[0]));
const meta = (html, key, value) => tags(html, "meta").find((a) => a[key] === value)?.content;
const stripTags = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** dist/a/b/index.html → /a/b/ , dist/404.html → /404.html */
function routeOf(file) {
  const rel = relative(DIR, file).split(sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
}

function resolvesInDist(href) {
  const path = decodeURI(href.split(/[?#]/)[0]);
  if (path.endsWith("/")) return existsSync(join(DIR, path, "index.html"));
  return existsSync(join(DIR, path));
}

const htmlFiles = walk(DIR).filter((f) => f.endsWith(".html"));
const homeCanonical = tags(readFileSync(join(DIR, "index.html"), "utf8"), "link").find((a) => a.rel === "canonical")?.href;
const origin = homeCanonical ? new URL(homeCanonical).origin : undefined;
if (!origin || !origin.startsWith("https://")) fail("index.html", `canonical이 https 절대 URL이 아니다(${homeCanonical})`);

let postPages = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const route = routeOf(file);
  const is404 = route === "/404.html";

  // 영어 사이트(/en/ 아래)는 lang="en", 나머지는 lang="ko" (D11)
  const expectedLang = route.startsWith("/en/") ? "en" : "ko";
  if (!new RegExp(`<html[^>]*\\blang="${expectedLang}"`).test(html)) fail(route, `<html lang="${expectedLang}">가 없다`);

  const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/g)];
  if (titles.length !== 1 || !titles[0][1].trim()) fail(route, "<title>이 정확히 1개, 비어 있지 않아야 한다");
  if (!meta(html, "name", "description")?.trim()) fail(route, "meta description이 없다");

  const canonical = tags(html, "link").find((a) => a.rel === "canonical")?.href;
  if (!canonical) {
    fail(route, "canonical이 없다");
  } else {
    const url = new URL(canonical);
    if (url.origin !== origin) fail(route, `canonical 도메인이 홈과 다르다(${canonical})`);
    if (!is404 && url.pathname !== route) fail(route, `canonical 경로(${url.pathname})가 페이지 주소와 다르다`);
    if (!is404 && !url.pathname.endsWith("/")) fail(route, "canonical이 끝 슬래시로 끝나지 않는다(D5)");
  }

  for (const prop of ["og:title", "og:description", "og:url", "og:type", "og:image"]) {
    if (!meta(html, "property", prop)) fail(route, `${prop}가 없다`);
  }
  if (canonical && meta(html, "property", "og:url") !== canonical) fail(route, "og:url이 canonical과 다르다");
  if (!/^https:\/\//.test(meta(html, "property", "og:image") ?? "")) fail(route, "og:image가 절대 URL이 아니다");

  // hreflang(SPEC §9.2): 대상 페이지가 있고, 그 페이지도 이 페이지를 가리켜야 한다
  for (const link of tags(html, "link").filter((a) => a.rel === "alternate" && a.hreflang)) {
    const target = new URL(link.href).pathname;
    if (target === route) continue;
    if (!resolvesInDist(target)) {
      fail(route, `hreflang 대상이 빌드 결과물에 없다(${target})`);
      continue;
    }
    const back = tags(readFileSync(join(DIR, target, "index.html"), "utf8"), "link").some(
      (a) => a.rel === "alternate" && a.hreflang && new URL(a.href).pathname === route,
    );
    if (!back) fail(route, `hreflang 대상(${target})이 이 페이지를 가리키지 않는다`);
  }

  const noindex = meta(html, "name", "robots")?.includes("noindex");
  if (is404 && !noindex) fail(route, "404 페이지에 noindex가 없다");

  for (const img of tags(html, "img")) {
    if (!img.alt?.trim()) fail(route, `alt 없는 이미지가 있다(${img.src})`);
  }

  for (const a of tags(html, "a")) {
    const href = a.href;
    // 바깥 사이트 링크는 새 탭으로 연다(SPEC §6.1)
    if (href && /^https?:\/\//.test(href) && new URL(href).origin !== origin && a.target !== "_blank") {
      fail(route, `바깥 링크에 target="_blank"가 없다(${href})`);
    }
    if (!href || !href.startsWith("/") || href.startsWith("//")) continue;
    if (!resolvesInDist(href)) fail(route, `내부 링크가 빌드 결과물에 없다(${href})`);
  }

  if (route.startsWith("/post/") || route.startsWith("/en/post/")) {
    postPages += 1;
    if (!/<h1\b/.test(html)) fail(route, "h1이 없다");
    if (!html.includes('"@type":"BlogPosting"')) fail(route, "BlogPosting JSON-LD가 없다");
    const article = html.match(/<article\b[\s\S]*<\/article>/)?.[0] ?? "";
    if (stripTags(article).length < MIN_ARTICLE_TEXT) fail(route, `본문 텍스트가 ${MIN_ARTICLE_TEXT}자 미만이다`);
    if (!DRAFTS_MODE && noindex) fail(route, "배포 빌드의 글 페이지에 noindex가 있다");
    // og:image(D12)가 빌드 결과물에 실제로 있어야 공유 미리보기가 보인다
    const ogImage = meta(html, "property", "og:image");
    if (ogImage && new URL(ogImage).origin === origin && !existsSync(join(DIR, decodeURI(new URL(ogImage).pathname)))) {
      fail(route, `og:image 파일이 빌드 결과물에 없다(${new URL(ogImage).pathname})`);
    }
  }
}

if (DRAFTS_MODE && postPages === 0) fail(DIR, "템플릿 검증 빌드에 글 페이지가 하나도 없다");

// 공개 글 데이터(SPEC D18): 형식이 맞고, 글마다 페이지가 결과물에 있어야 한다
const postsData = (() => {
  const file = join(DIR, "data", "posts.json");
  if (!existsSync(file)) return [];
  try {
    const { posts } = JSON.parse(readFileSync(file, "utf8"));
    if (Array.isArray(posts)) return posts;
    fail("/data/posts.json", "posts 배열이 없다");
    return [];
  } catch {
    fail("/data/posts.json", "JSON으로 읽을 수 없다");
    return [];
  }
})();
for (const p of postsData) {
  const route = `${p.lang === "en" ? "/en" : ""}/post/${p.slug}/`;
  for (const key of ["slug", "lang", "url", "title", "description", "publishedAt", "body"]) {
    if (!p[key]) fail("/data/posts.json", `${route}: ${key}가 비어 있다`);
  }
  if (!existsSync(join(DIR, route, "index.html"))) fail("/data/posts.json", `${route}: 글 페이지가 결과물에 없다`);
}
if (DRAFTS_MODE && postsData.length === 0) fail("/data/posts.json", "템플릿 검증 빌드인데 글이 하나도 없다");

// 배포 빌드: published가 아닌 글이 결과물, sitemap, RSS에 새지 않았는지 확인한다
if (!DRAFTS_MODE) {
  const feeds = walk(DIR)
    .filter((f) => /sitemap.*\.xml$|rss\.xml$/.test(f))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  // 한국어 글 posts/<slug>.md → /post/<slug>/, 영어 글 posts/en/<slug>.md → /en/post/<slug>/
  for (const [dir, prefix] of [[POSTS_DIR, "/post/"], [join(POSTS_DIR, "en"), "/en/post/"]]) {
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const front = readFileSync(join(dir, file), "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
      const data = parse(front) ?? {};
      const route = `${prefix}${file.replace(/\.md$/, "")}/`;
      const lang = prefix === "/en/post/" ? "en" : "ko";
      const inData = postsData.some((p) => p.lang === lang && p.slug === file.replace(/\.md$/, ""));
      if (data.status === "published") {
        if (!inData) fail(route, "published 글이 /data/posts.json에 없다");
        continue;
      }
      if (existsSync(join(DIR, route))) fail(route, `status: ${data.status} 글이 배포 결과물에 있다`);
      if (feeds.includes(route)) fail(route, `status: ${data.status} 글이 sitemap이나 RSS에 있다`);
      if (inData) {
        fail(route, `status: ${data.status} 글이 /data/posts.json에 있다`);
      }
    }
  }
}

for (const e of errors) console.error(`오류  ${e}`);
console.log(
  `check-html(${DRAFTS_MODE ? "템플릿 검증" : "배포"} 빌드, ${DIR}): HTML ${htmlFiles.length}개, 글 페이지 ${postPages}개, 오류 ${errors.length}`,
);
process.exit(errors.length > 0 ? 1 : 0);
