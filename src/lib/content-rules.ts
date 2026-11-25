// 글 규칙의 단일 소스(SPEC §5, §9.2, §9.4).
// 사이트 빌드(content.config.ts), 콘텐츠 검사(scripts/check-content.ts), 블로그 MCP 서버(mcp/)가 함께 쓴다.
// Node가 직접 실행할 수 있도록 상대 경로 import에 .ts 확장자를 붙이고, astro: 모듈을 쓰지 않는다.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { parse } from "yaml";
import { z } from "astro/zod";
import { categorySlugs } from "../data/categories.ts";
import { LANGS, type Lang } from "../i18n.ts";
import affiliate from "../data/affiliate-domains.json" with { type: "json" };

export const POSTS_DIR = "src/content/posts";
/** 언어별 폴더(SPEC §9.2): 한국어는 posts/, 영어는 posts/en/ */
export const LANG_DIRS: Record<Lang, string> = { ko: POSTS_DIR, en: `${POSTS_DIR}/en` };
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** 이 이름으로 시작하는 글은 템플릿 검증용 샘플이다. 항상 draft로 둔다. */
export const TEMPLATE_FIXTURE = "template-check";
const MARKERS = ["[경험 추가 필요", "[출처 확인 필요"];
/** 글 템플릿(src/content/templates/)의 작성 안내 주석. 검수 전에 지운다(SPEC §5.7). */
const TEMPLATE_GUIDE = "<!-- 안내:";

// ── frontmatter 스키마 (SPEC §5.1, §5.2 중 frontmatter로 판단할 수 있는 것) ──

// YAML에서 `reviewed_at:`처럼 값을 비워 두면 null이 된다. 비어 있음은 undefined로 통일한다.
const emptyToUndefined = (v: unknown) => (v === null || v === "" ? undefined : v);
const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());
const optionalText = z.preprocess(emptyToUndefined, z.string().min(1).optional());

/**
 * 글 frontmatter 스키마. cover 이미지 경로만 환경에 따라 다르게 검사한다.
 * - 사이트 빌드: Astro의 image()로 실제 파일과 크기를 확인한다.
 * - 검사 스크립트·MCP 서버: 문자열인지만 본다.
 */
export function postSchema<Src extends z.ZodType>(coverSrc: Src) {
  return z
    .object({
      title: z.string().min(1),
      slug: z.string().regex(SLUG_PATTERN, "slug는 영문 소문자, 숫자, 하이픈만 쓴다"),
      description: z.string().min(1),
      category: z.enum(categorySlugs),
      tags: z
        .array(z.string().min(1).refine((t) => t === t.toLowerCase(), "태그는 소문자로 쓴다"))
        .default([]),
      status: z.enum(["draft", "reviewed", "published"]),
      lang: z.enum(LANGS).default("ko"),
      translated_from: z.enum(LANGS).optional(),
      ai_assisted: z.boolean(),
      audience: z.string().min(1),
      search_intent: z.string().min(1),
      created_at: z.coerce.date(),
      reviewed_at: optionalDate,
      reviewed_by: optionalText,
      review_notes: optionalText,
      published_at: optionalDate,
      updated_at: optionalDate,
      disclosure: optionalText,
      sources: z
        .array(
          z.object({
            title: z.string().min(1),
            url: z.url(),
            accessed: z.coerce.date(),
          }),
        )
        .default([]),
      cover: z
        .object({
          src: coverSrc,
          alt: z.string().min(1, "cover 이미지에는 alt가 필요하다"),
        })
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (data.translated_from !== undefined) {
        if (data.translated_from === data.lang) {
          ctx.addIssue({ code: "custom", path: ["translated_from"], message: "translated_from은 글의 lang과 달라야 한다" });
        }
        if (!data.ai_assisted) {
          ctx.addIssue({ code: "custom", path: ["ai_assisted"], message: "번역본은 AI 초안이므로 ai_assisted: true다 (SPEC §9.2)" });
        }
      }
      if (data.status !== "draft") {
        for (const field of ["reviewed_at", "reviewed_by", "review_notes"] as const) {
          if (data[field] === undefined) {
            ctx.addIssue({
              code: "custom",
              path: [field],
              message: `status가 ${data.status}이면 ${field}가 필요하다 (review-post 승인 기록)`,
            });
          }
        }
      }
      if (data.status === "published" && data.published_at === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["published_at"],
          message: "status가 published이면 published_at이 필요하다 (publish-post 기록)",
        });
      }
    });
}

/** 검사 스크립트와 MCP 서버용 스키마 (cover.src는 문자열) */
export const plainPostSchema = postSchema(z.string().min(1));
export type PostData = z.infer<typeof plainPostSchema>;

// ── 글 파일 읽기 ──

export interface PostSource {
  /** 저장소 기준 경로. 예: src/content/posts/en/a.md */
  path: string;
  /** 파일이 있는 폴더의 언어 */
  dirLang: Lang;
  /** 파일명에서 .md를 뺀 것 */
  name: string;
  raw: string;
}

/** 저장소 루트(root) 아래의 모든 글 파일을 읽는다. */
export function readPostSources(root = "."): PostSource[] {
  return LANGS.flatMap((dirLang) => {
    const dir = LANG_DIRS[dirLang];
    if (!existsSync(join(root, dir))) return [];
    return readdirSync(join(root, dir))
      .filter((f) => f.endsWith(".md"))
      .map((file) => ({
        path: `${dir}/${file}`,
        dirLang,
        name: basename(file, ".md"),
        raw: readFileSync(join(root, dir, file), "utf8"),
      }));
  });
}

/** frontmatter와 본문을 나눈다. 형식이 틀리면 이유를 돌려준다. */
export function splitPost(raw: string): { front: Record<string, unknown>; body: string } | { error: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { error: "frontmatter(---로 감싼 머리말)가 없다" };
  try {
    return { front: (parse(match[1]) ?? {}) as Record<string, unknown>, body: match[2] };
  } catch (e) {
    return { error: `frontmatter YAML을 읽을 수 없다: ${(e as Error).message}` };
  }
}

// ── 검사 (SPEC §5.2) ──

export interface CheckResult {
  errors: string[];
  warnings: string[];
}

function isAffiliate(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return affiliate.domains.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

interface Entry {
  source: PostSource;
  front: Record<string, unknown>;
}

/**
 * 글 전체를 검사한다. reviewed·published 글의 본문 문제는 오류, draft 글은 경고다.
 * frontmatter 스키마는 schema: true일 때만 본다(사이트 빌드가 이미 같은 스키마로 검사하므로 CLI는 끈다).
 */
export function checkPosts(sources: PostSource[], { schema = false } = {}): CheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const entries = new Map<string, Entry>(); // "<lang>/<slug>" → 글

  for (const source of sources) {
    const where = source.path;
    const split = splitPost(source.raw);
    if ("error" in split) {
      errors.push(`${where}: ${split.error}`);
      continue;
    }
    const { front: data, body } = split;
    const { name, dirLang } = source;
    const strict = data.status === "reviewed" || data.status === "published";
    const report = (message: string) => (strict ? errors : warnings).push(`${where}: ${message}`);

    if (schema) {
      const parsed = plainPostSchema.safeParse(data);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) errors.push(`${where}: ${issue.path.join(".") || "frontmatter"}: ${issue.message}`);
      }
    }

    // slug = 파일명 (글 주소가 파일명으로 정해진다)
    if (!SLUG_PATTERN.test(name)) errors.push(`${where}: 파일명은 영문 소문자·숫자·하이픈만 쓴다`);
    if (data.slug !== name) errors.push(`${where}: frontmatter slug(${data.slug})가 파일명(${name})과 다르다`);
    // 같은 언어 안에서만 slug가 겹치면 안 된다. 원문과 번역본은 같은 slug를 쓴다.
    const key = `${dirLang}/${data.slug}`;
    const dup = entries.get(key);
    if (dup) errors.push(`${where}: slug가 ${dup.source.path}와 겹친다`);
    entries.set(key, { source, front: data });

    // lang은 폴더와 맞아야 한다 (lang을 생략하면 ko)
    const lang = data.lang ?? "ko";
    if (lang !== dirLang) errors.push(`${where}: lang(${lang})이 폴더(${dirLang === "en" ? "posts/en/" : "posts/"})와 맞지 않다`);

    // 템플릿 검증용 샘플(template-check로 시작하는 파일)은 절대 발행하지 않는다
    if (name.startsWith(TEMPLATE_FIXTURE) && data.status !== "draft") {
      errors.push(`${where}: 템플릿 검증용 샘플은 status: draft로 둔다`);
    }

    // 보완 표시가 남은 글은 검수·발행할 수 없다
    for (const marker of MARKERS) {
      if (body.includes(marker)) report(`본문에 '${marker}]' 표시가 남아 있다`);
    }

    // 템플릿 안내 주석은 화면에는 안 보여도 HTML에 남는다. 검수·발행 전에 지운다.
    if (strict && body.includes(TEMPLATE_GUIDE)) errors.push(`${where}: 템플릿 안내 주석(${TEMPLATE_GUIDE} …)이 남아 있다`);

    // 제휴 링크가 있으면 disclosure 필수
    const links = [
      ...[...body.matchAll(/\]\((https?:\/\/[^)\s]+)/g)].map((m) => m[1]),
      ...[...body.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]),
    ];
    const affiliateLink = links.find(isAffiliate);
    if (affiliateLink && !data.disclosure) report(`제휴 링크(${affiliateLink})가 있는데 disclosure가 비어 있다`);

    // 이미지: alt 필수, 외부 이미지 금지
    for (const [, alt, src] of body.matchAll(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g)) {
      if (!alt.trim()) report(`이미지(${src})에 alt가 없다`);
      if (/^https?:\/\//.test(src)) report(`외부 이미지(${src})는 쓰지 않는다. src/assets/posts/${name}/에 넣는다`);
    }
  }

  // 번역본: 반대 언어 폴더에 같은 slug의 원문이 있어야 한다
  for (const [key, { source, front }] of entries) {
    const from = front.translated_from as Lang | undefined;
    if (!from) continue;
    const slug = key.slice(key.indexOf("/") + 1);
    const original = entries.get(`${from}/${slug}`);
    if (!original) {
      errors.push(`${source.path}: 원문(${from}, slug ${slug})이 없다`);
      continue;
    }
    // 검수를 마친 번역본인데 그 뒤에 원문이 고쳐졌으면 재검수 대상이다(SPEC §9.2). 발행은 막지 않고 경고만 낸다.
    const updated = original.front.updated_at ? new Date(original.front.updated_at as string) : undefined;
    const reviewed = front.reviewed_at ? new Date(front.reviewed_at as string) : undefined;
    if (updated && reviewed && updated > reviewed) {
      warnings.push(
        `${source.path}: 원문이 번역 검수 뒤에 고쳐졌다(원문 updated_at ${original.front.updated_at} > 번역본 reviewed_at ${front.reviewed_at}). 번역본을 원문에 맞춰 고치고 다시 검수한다`,
      );
    }
  }

  // 두 언어에 같은 slug가 있으면 원문·번역본 짝이어야 한다. 사이트는 같은 slug를 짝으로 보고 서로 연결한다.
  for (const [key, en] of entries) {
    if (!key.startsWith("en/")) continue;
    const ko = entries.get(`ko/${key.slice(3)}`);
    if (ko && !en.front.translated_from && !ko.front.translated_from) {
      errors.push(
        `${en.source.path}: ${ko.source.path}와 slug가 같은데 어느 쪽도 translated_from이 없다. 번역 관계가 아니면 slug를 다르게 쓴다`,
      );
    }
  }

  return { errors, warnings };
}
