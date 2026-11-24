import { getCollection, type CollectionEntry } from "astro:content";
import { categoryWithChildren } from "../data/categories";

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

export function postUrl(post: Post): string {
  return `/post/${post.id}/`;
}

/** 공개 대상 글을 최신순으로 돌려준다. */
export async function getVisiblePosts(): Promise<Post[]> {
  const posts = await getCollection("posts", (p) => includeDrafts || p.data.status === "published");
  return posts.sort((a, b) => postDate(b).getTime() - postDate(a).getTime());
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
export function listPageUrl(page: number): string {
  return page <= 1 ? "/" : `/page/${page}/`;
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

/** <time datetime>와 JSON-LD용 YYYY-MM-DD */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
