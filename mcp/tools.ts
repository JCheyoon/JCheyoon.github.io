// 블로그 MCP 서버의 도구 동작(SPEC §9.4). MCP와 상관없는 순수 함수로 두어 테스트하기 쉽게 한다.
// 규칙은 모두 src/lib/content-rules.ts에서 가져온다. 여기서 규칙을 새로 정하지 않는다.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { stringify } from "yaml";
import { LANG_DIRS, checkPosts, readPostSources, splitPost, type PostSource } from "../src/lib/content-rules.ts";
import type { Lang } from "../src/i18n.ts";

export interface PostSummary {
  slug: string;
  lang: Lang;
  title: string;
  status: string;
  category: string;
  path: string;
  /** 번역본이면 원문 언어 */
  translated_from?: Lang;
  /** 반대 언어에 같은 slug의 글(원문 또는 번역본)이 있는지 */
  has_counterpart: boolean;
}

function summarize(source: PostSource): Omit<PostSummary, "has_counterpart"> | undefined {
  const split = splitPost(source.raw);
  if ("error" in split) return undefined;
  const f = split.front;
  return {
    slug: String(f.slug ?? source.name),
    lang: source.dirLang,
    title: String(f.title ?? ""),
    status: String(f.status ?? ""),
    category: String(f.category ?? ""),
    path: source.path,
    ...(f.translated_from ? { translated_from: f.translated_from as Lang } : {}),
  };
}

/** 글 목록. 언어와 상태로 거를 수 있다. 형식이 깨진 파일은 check_post로 확인하도록 목록에서 뺀다. */
export function listPosts(root: string, filter: { lang?: Lang; status?: string } = {}): PostSummary[] {
  const all = readPostSources(root)
    .map(summarize)
    .filter((p) => p !== undefined);
  const keys = new Set(all.map((p) => `${p.lang}/${p.slug}`));
  return all
    .filter((p) => (!filter.lang || p.lang === filter.lang) && (!filter.status || p.status === filter.status))
    .map((p) => ({ ...p, has_counterpart: keys.has(`${p.lang === "ko" ? "en" : "ko"}/${p.slug}`) }));
}

export interface PostCheck {
  path: string;
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 글 한 편 검사. frontmatter 스키마까지 본다(빌드 없이 바로 알려 주기 위해).
 * 원문 존재, slug 중복처럼 다른 글과 엮인 규칙도 보므로 전체를 검사한 뒤 이 글에 대한 것만 남긴다.
 */
export function checkPost(root: string, slug: string, lang: Lang): PostCheck | undefined {
  const sources = readPostSources(root);
  const target = sources.find((s) => s.dirLang === lang && s.name === slug);
  if (!target) return undefined;
  const { errors, warnings } = checkPosts(sources, { schema: true });
  const mine = (m: string) => m.startsWith(`${target.path}:`);
  const e = errors.filter(mine);
  return { path: target.path, ok: e.length === 0, errors: e, warnings: warnings.filter(mine) };
}

// ── 글 템플릿 (SPEC §5.7) ──

const TEMPLATES_DIR = "src/content/templates";

export interface Template {
  name: string;
  label: string;
  /** base: 기본 템플릿, option: 기본 템플릿 뒤에 붙이는 선택 블록 */
  kind: "base" | "option";
  /** 언제 쓰는지. 주제에 맞는 템플릿을 고르는 근거 */
  when: string;
  /** 본문 뼈대 */
  body: string;
}

export function listTemplates(root: string): Template[] {
  const dir = join(root, TEMPLATES_DIR);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const split = splitPost(readFileSync(join(dir, file), "utf8"));
      if ("error" in split) throw new Error(`${TEMPLATES_DIR}/${file}: ${split.error}`);
      const f = split.front;
      return {
        name: String(f.name ?? basename(file, ".md")),
        label: String(f.label),
        kind: f.kind === "option" ? "option" : "base",
        when: String(f.when),
        body: split.body.trim(),
      } satisfies Template;
    });
}

// ── 초안 만들기 ──

export interface DraftInput {
  slug: string;
  lang: Lang;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  audience: string;
  search_intent: string;
  /** 작성한 본문. 없으면 템플릿 뼈대를 넣는다. */
  body?: string;
  template?: string;
  options?: string[];
}

export type WriteResult = { ok: true; path: string; warnings: string[] } | { ok: false; errors: string[] };

/** 작성자 기준 날짜(서울) YYYY-MM-DD */
function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

/** frontmatter를 저장소의 글과 같은 순서·모양으로 쓴다. 빈 값은 `key:`로 둔다. */
function renderPost(front: Record<string, unknown>, body: string): string {
  return `---\n${stringify(front, { nullStr: "", lineWidth: 0 })}---\n\n${body.trim()}\n`;
}

/**
 * 새 글 파일을 검사한 뒤에만 쓴다. 다른 글과 엮인 규칙(slug 중복, 언어 짝)도 함께 본다.
 * 언어 짝 오류처럼 다른 파일 이름으로 보고되는 오류도 있으므로,
 * "이 파일을 넣었을 때 새로 생기는 오류"가 하나라도 있으면 파일을 만들지 않는다.
 */
function writeChecked(root: string, lang: Lang, slug: string, content: string): WriteResult {
  const path = `${LANG_DIRS[lang]}/${slug}.md`;
  if (existsSync(join(root, path))) return { ok: false, errors: [`${path}가 이미 있다. 기존 글을 고치려면 파일을 직접 수정한다`] };
  const existing = readPostSources(root);
  const before = checkPosts(existing, { schema: true });
  const after = checkPosts([...existing, { path, dirLang: lang, name: slug, raw: content }], { schema: true });
  const added = (list: string[], prev: string[]) => list.filter((m) => !prev.includes(m));
  const errors = added(after.errors, before.errors);
  if (errors.length > 0) return { ok: false, errors };
  writeFileSync(join(root, path), content);
  return { ok: true, path, warnings: added(after.warnings, before.warnings) };
}

/** 본문: 직접 준 본문, 아니면 기본 템플릿 + 선택 블록의 뼈대 */
function draftBody(root: string, input: DraftInput): { body: string } | { error: string } {
  if (input.body?.trim()) return { body: input.body };
  if (!input.template) return { error: "body나 template 중 하나는 있어야 한다" };
  const templates = listTemplates(root);
  const find = (name: string, kind: Template["kind"]) => templates.find((t) => t.name === name && t.kind === kind);
  const base = find(input.template, "base");
  if (!base) return { error: `기본 템플릿 ${input.template}이 없다. list_templates로 이름을 확인한다` };
  const parts = [base.body];
  for (const name of input.options ?? []) {
    const option = find(name, "option");
    if (!option) return { error: `선택 블록 ${name}이 없다. list_templates로 이름을 확인한다` };
    parts.push(option.body);
  }
  return { body: parts.join("\n\n") };
}

/**
 * 새 초안(원문)을 만든다(SPEC §9.4). 상태는 항상 draft, ai_assisted는 항상 true다.
 * 번역본은 translate_post로 만든다.
 */
export function createDraft(root: string, input: DraftInput): WriteResult {
  const body = draftBody(root, input);
  if ("error" in body) return { ok: false, errors: [body.error] };
  const front = {
    title: input.title,
    slug: input.slug,
    description: input.description,
    category: input.category,
    tags: input.tags ?? [],
    status: "draft",
    lang: input.lang,
    ai_assisted: true,
    audience: input.audience,
    search_intent: input.search_intent,
    created_at: today(),
    reviewed_at: null,
    reviewed_by: null,
    review_notes: null,
    published_at: null,
    updated_at: null,
    disclosure: null,
  };
  return writeChecked(root, input.lang, input.slug, renderPost(front, body.body));
}

// ── 번역 초안 (SPEC §9.2) ──

export interface TranslationInput {
  slug: string;
  /** 원문 언어. 번역본은 반대 언어로 만든다. */
  from: Lang;
  title: string;
  description: string;
  audience: string;
  search_intent: string;
  /** 번역한 본문 (Markdown, frontmatter 제외) */
  body: string;
  /** 원문에 disclosure가 있으면 번역한 문구가 필요하다 */
  disclosure?: string;
}

/** posts/<slug>.md와 posts/en/<slug>.md는 폴더 깊이가 달라서 이미지 상대 경로의 ../ 개수가 다르다 */
function moveRelative(path: string, from: Lang, to: Lang): string {
  if (!path.startsWith("../")) return path;
  if (from === "ko" && to === "en") return `../${path}`;
  if (from === "en" && to === "ko") return path.replace(/^\.\.\//, "");
  return path;
}

/**
 * published 원문 1편의 번역 초안을 반대 언어 폴더에 만든다(SPEC §9.2, §9.4).
 * 번역문은 클라이언트의 모델이 쓰고, 이 도구는 원문 확인, frontmatter 고정, 검사, 저장만 한다.
 */
export function translatePost(root: string, input: TranslationInput): WriteResult {
  const to: Lang = input.from === "ko" ? "en" : "ko";
  const original = readPostSources(root).find((s) => s.dirLang === input.from && s.name === input.slug);
  if (!original) return { ok: false, errors: [`${input.from} 원문 ${input.slug}가 없다`] };
  const split = splitPost(original.raw);
  if ("error" in split) return { ok: false, errors: [`${original.path}: ${split.error}`] };
  const o = split.front;
  if (o.translated_from) return { ok: false, errors: [`${original.path}는 번역본이다. 번역본을 다시 번역하지 않는다`] };
  if (o.status !== "published") {
    return { ok: false, errors: [`${original.path}의 status가 ${o.status}다. 번역은 published 원문만 한다`] };
  }
  if (o.disclosure && !input.disclosure?.trim()) {
    return { ok: false, errors: [`원문에 disclosure가 있다. 번역한 disclosure 문구를 함께 넘긴다`] };
  }

  // 본문 이미지는 번역본 위치 기준으로 실제 파일이 있어야 한다(Astro 빌드가 실패하기 전에 알려 준다)
  const targetDir = join(root, LANG_DIRS[to]);
  for (const [, , src] of input.body.matchAll(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g)) {
    if (/^https?:\/\//.test(src) || existsSync(join(targetDir, src))) continue;
    // 원문 경로를 그대로 옮긴 경우가 대부분이므로 번역본 위치에 맞춘 경로를 알려 준다
    const moved = moveRelative(src, input.from, to);
    const hint = existsSync(join(targetDir, moved)) ? ` 번역본에서는 ${moved}로 쓴다` : "";
    return { ok: false, errors: [`본문 이미지 ${src}가 번역본 위치(${LANG_DIRS[to]}/)에서 보이지 않는다.${hint}`] };
  }

  const cover = o.cover as { src: string; alt: string } | undefined;
  const front = {
    title: input.title,
    slug: input.slug,
    description: input.description,
    category: o.category,
    tags: o.tags ?? [],
    status: "draft",
    lang: to,
    translated_from: input.from,
    ai_assisted: true,
    audience: input.audience,
    search_intent: input.search_intent,
    created_at: today(),
    reviewed_at: null,
    reviewed_by: null,
    review_notes: null,
    published_at: null,
    updated_at: null,
    disclosure: input.disclosure?.trim() || null,
    ...(o.sources ? { sources: o.sources } : {}),
    // cover alt는 원문 언어 그대로다. 검수할 때 번역한다.
    ...(cover ? { cover: { src: moveRelative(cover.src, input.from, to), alt: cover.alt } } : {}),
  };
  return writeChecked(root, to, input.slug, renderPost(front, input.body));
}
