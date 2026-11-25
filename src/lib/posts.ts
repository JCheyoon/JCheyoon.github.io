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

/** 자동 생성 OG 이미지의 경로 부분(D12). 한국어 `<slug>`, 영어 `en/<slug>` → /og/<경로>.png */
export function ogImagePath(post: Post): string {
  return post.data.lang === "en" ? `en/${post.data.slug}` : post.data.slug;
}

/** 글의 OG 이미지 주소. cover가 있으면 cover, 없으면 빌드가 만든 /og/….png */
export function ogImageUrl(post: Post): string {
  return post.data.cover ? post.data.cover.src.src : `/og/${ogImagePath(post)}.png`;
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

/** 페이지를 나눈 목록의 n페이지 주소. 1페이지는 base 그대로, 2페이지부터 base + page/n/ (SPEC §4) */
export function pagedUrl(base: string, page: number): string {
  return page <= 1 ? base : `${base}page/${page}/`;
}

/** 전체 글 목록 n페이지 주소. 1페이지는 홈이다(SPEC §4). */
export function listPageUrl(page: number, lang: Lang = "ko"): string {
  return pagedUrl(localizePath(lang, "/"), page);
}

/**
 * 글 목록 페이지인지(홈과 그 n페이지, 카테고리·태그 목록). 헤더 메뉴와 하단 탭 바가 "홈"을 현재 메뉴로 칠할 때 쓴다.
 * 카테고리·태그는 홈 목록을 거른 화면이라, 여기서 홈 표시가 꺼지면 지금 어느 메뉴에 있는지 알 수 없다.
 * 그 페이지 자체가 홈은 아니므로 aria-current는 "page" 대신 "true"(이 메뉴 안에 있음)를 쓴다.
 */
export function isListPage(path: string, lang: Lang = "ko"): boolean {
  return path === localizePath(lang, "/") || ["/page/", "/category/", "/tag/"].some((p) => path.startsWith(localizePath(lang, p)));
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

// 아카이브의 월·일(MM-DD). 연도는 아카이브가 묶음 제목으로 따로 보여 준다
const monthDayFormatter = new Intl.DateTimeFormat("en-CA", { month: "2-digit", day: "2-digit", timeZone: "Asia/Seoul" });
const yearFormatter = new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Seoul" });

export function formatMonthDay(date: Date): string {
  return monthDayFormatter.format(date);
}

/** 서울 기준 연도(화면 날짜와 같은 기준) */
export function yearOf(date: Date): number {
  return Number(yearFormatter.format(date));
}

// 화면 날짜와 같은 서울 기준 날짜. UTC로 자르면 서울 오전 9시 전 글은 하루 앞 날짜가 된다
const isoDateFormatter = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Seoul" });

/** <time datetime>용 YYYY-MM-DD(서울 기준) */
export function isoDate(date: Date): string {
  return isoDateFormatter.format(date);
}
