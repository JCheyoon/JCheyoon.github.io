// 블로그 MCP 서버의 도구 동작(SPEC §9.4). MCP와 상관없는 순수 함수로 두어 테스트하기 쉽게 한다.
// 규칙은 모두 src/lib/content-rules.ts에서 가져온다. 여기서 규칙을 새로 정하지 않는다.
import { checkPosts, readPostSources, splitPost, type PostSource } from "../src/lib/content-rules.ts";
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
