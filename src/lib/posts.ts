import { getCollection, type CollectionEntry } from "astro:content";
import { categoryWithChildren } from "../data/categories";
import { localizePath, ui, type Lang } from "../i18n";

export type Post = CollectionEntry<"posts">;

/**
 * draft·reviewed 글을 보여 줄지 여부(SPEC §5.5).
 * - 개발 서버(npm run dev): 보여 준다.
 * - 템플릿 검증 빌드(INCLUDE_DRAFTS=true): 보여 준다. 결과는 dist-drafts/에만 나간다.
 * - 배포 빌드: published 글만.
 */
export const includeDrafts: boolean = import.meta.env.DEV || __INCLUDE_DRAFTS__;

/** 화면, RSS, JSON-LD에 쓰는 날짜. 발행 전 글은 작성일을 쓴다. */
export function postDate(post: Post): Date {
  return post.data.published_at ?? post.data.created_at;
}

/** 한국어 글은 `/post/<slug>/`, 영어 글은 `/en/post/<slug>/` (SPEC §4) */
export function postUrl(post: Post): string {
  return localizePath(post.data.lang, `/post/${post.data.slug}/`);
}

/** 공개 대상 글 중 한 언어의 글을 최신순으로 돌려준다. 언어별 사이트는 자기 언어 글만 보여 준다(D11). */
export async function getVisiblePosts(lang: Lang = "ko"): Promise<Post[]> {
  const posts = await getCollection(
    "posts",
    (p) => p.data.lang === lang && (includeDrafts || p.data.status === "published"),
  );
  return posts.sort((a, b) => postDate(b).getTime() - postDate(a).getTime());
}

/** 태그 페이지 주소(D13). 한국어 `/tag/<tag>/`, 영어 `/en/tag/<tag>/` */
export function tagUrl(tag: string, lang: Lang = "ko"): string {
  return localizePath(lang, `/tag/${tag}/`);
}

/** 글 목록에 쓰인 태그와 글 수. 글이 많은 태그부터, 같으면 이름순 */
export function tagCounts(posts: Post[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** 카테고리 페이지용: 해당 카테고리와 하위 카테고리의 글 */
export function filterByCategory(posts: Post[], categorySlug: string): Post[] {
  const slugs = categoryWithChildren(categorySlug);
  return posts.filter((p) => slugs.includes(p.data.category));
}

export function totalPages(count: number, pageSize: number): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

/** 목록 n페이지 주소. 1페이지는 홈이다(SPEC §4). */
export function listPageUrl(page: number, lang: Lang = "ko"): string {
  return localizePath(lang, page <= 1 ? "/" : `/page/${page}/`);
}

// 날짜는 언어와 관계없이 서울 기준으로 표시한다(작성자 기준 날짜).
const dateFormatters = Object.fromEntries(
  (Object.keys(ui) as Lang[]).map((lang) => [
    lang,
    new Intl.DateTimeFormat(ui[lang].dateLocale, { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul" }),
  ]),
) as Record<Lang, Intl.DateTimeFormat>;

export function formatDate(date: Date, lang: Lang = "ko"): string {
  return dateFormatters[lang].format(date);
}

/** <time datetime>와 JSON-LD용 YYYY-MM-DD */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
