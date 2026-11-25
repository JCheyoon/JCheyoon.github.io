// 목록 필터 항목(SPEC §6.2). 데스크톱 사이드바와 모바일 필터 시트가 같은 규칙을 쓰도록 한곳에 둔다.
// 활성 판단은 주소 앞부분으로 한다(페이지를 나눈 /category/x/page/2/에서도 그 카테고리가 활성).
import { categories, categoryName, categoryUrl } from "../data/categories";
import { filterByCategory, tagCounts, tagUrl, type Post } from "./posts";
import { localizePath, ui, type Lang } from "../i18n";

export interface CategoryItem {
  href: string;
  name: string;
  count: number;
  active: boolean;
}

/** 맨 위 "전체 글"(홈 목록) + 글이 있는 카테고리 */
export function categoryItems(posts: Post[], lang: Lang, path: string): CategoryItem[] {
  const home = localizePath(lang, "/");
  return [
    { href: home, name: ui[lang].allPosts, count: posts.length, active: path === home || path.startsWith(localizePath(lang, "/page/")) },
    ...categories
      .map((c) => ({ c, count: filterByCategory(posts, c.slug).length }))
      .filter(({ count }) => count > 0)
      .map(({ c, count }) => {
        const href = categoryUrl(c.slug, lang);
        return { href, name: categoryName(c, lang), count, active: path.startsWith(href) };
      }),
  ];
}

export interface TagItem {
  tag: string;
  count: number;
  active: boolean;
  /** 고른 태그는 다시 누르면 해제(전체 글로), 아니면 태그 페이지 */
  href: string;
}

export function tagItems(posts: Post[], lang: Lang, path: string): TagItem[] {
  const home = localizePath(lang, "/");
  return tagCounts(posts).map(({ tag, count }) => {
    const active = path.startsWith(tagUrl(tag, lang));
    return { tag, count, active, href: active ? home : tagUrl(tag, lang) };
  });
}
