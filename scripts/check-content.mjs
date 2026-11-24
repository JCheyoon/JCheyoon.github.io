#!/usr/bin/env node
// 본문까지 봐야 하는 콘텐츠 검사(SPEC §5.2).
// frontmatter 필드와 상태별 필수값은 src/content.config.ts의 스키마가 빌드 때 검사한다.
//
// reviewed·published 글은 문제가 있으면 실패(exit 1), draft 글은 경고만 낸다.
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { parse } from "yaml";

const POSTS_DIR = "src/content/posts";
const TEMPLATE_FIXTURE = "template-check";
const MARKERS = ["[경험 추가 필요", "[출처 확인 필요"];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const { domains: AFFILIATE_DOMAINS } = JSON.parse(readFileSync("src/data/affiliate-domains.json", "utf8"));

const errors = [];
const warnings = [];
const slugs = new Map();

function isAffiliate(url) {
  try {
    const host = new URL(url).hostname;
    return AFFILIATE_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

for (const file of files) {
  const where = `${POSTS_DIR}/${file}`;
  const raw = readFileSync(join(POSTS_DIR, file), "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    errors.push(`${where}: frontmatter(---로 감싼 머리말)가 없다`);
    continue;
  }

  let data;
  try {
    data = parse(match[1]) ?? {};
  } catch (e) {
    errors.push(`${where}: frontmatter YAML을 읽을 수 없다: ${e.message}`);
    continue;
  }

  const body = match[2];
  const name = basename(file, ".md");
  const strict = data.status === "reviewed" || data.status === "published";
  const report = (message) => (strict ? errors : warnings).push(`${where}: ${message}`);

  // slug = 파일명 (글 주소가 파일명으로 정해진다)
  if (!SLUG_PATTERN.test(name)) errors.push(`${where}: 파일명은 영문 소문자·숫자·하이픈만 쓴다`);
  if (data.slug !== name) errors.push(`${where}: frontmatter slug(${data.slug})가 파일명(${name})과 다르다`);
  if (slugs.has(data.slug)) errors.push(`${where}: slug가 ${slugs.get(data.slug)}와 겹친다`);
  slugs.set(data.slug, where);

  // 템플릿 검증용 샘플은 절대 발행하지 않는다
  if (name === TEMPLATE_FIXTURE && data.status !== "draft") {
    errors.push(`${where}: 템플릿 검증용 샘플은 status: draft로 둔다`);
  }

  // 보완 표시가 남은 글은 검수·발행할 수 없다
  for (const marker of MARKERS) {
    if (body.includes(marker)) report(`본문에 '${marker}]' 표시가 남아 있다`);
  }

  // 제휴 링크가 있으면 disclosure 필수
  const links = [
    ...[...body.matchAll(/\]\((https?:\/\/[^)\s]+)/g)].map((m) => m[1]),
    ...[...body.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]),
  ];
  const affiliate = links.find(isAffiliate);
  if (affiliate && !data.disclosure) report(`제휴 링크(${affiliate})가 있는데 disclosure가 비어 있다`);

  // 이미지: alt 필수, 외부 이미지 금지
  for (const [, alt, src] of body.matchAll(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g)) {
    if (!alt.trim()) report(`이미지(${src})에 alt가 없다`);
    if (/^https?:\/\//.test(src)) report(`외부 이미지(${src})는 쓰지 않는다. src/assets/posts/${name}/에 넣는다`);
  }
}

for (const w of warnings) console.warn(`경고  ${w}`);
for (const e of errors) console.error(`오류  ${e}`);
console.log(`check-content: 글 ${files.length}편, 오류 ${errors.length}, 경고 ${warnings.length}`);
process.exit(errors.length > 0 ? 1 : 0);
