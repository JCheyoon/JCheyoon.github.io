// 카테고리·태그 목록 페이지의 getStaticPaths 값(SPEC §4). 1페이지 라우트와 n페이지 라우트가 같이 쓴다.
// 다른 언어에 같은 카테고리·태그의 같은 번호 페이지가 있으면 그 페이지를 짝(alternate)으로 둔다.
import { site } from "../site.config";
import { categories, categoryName, categoryUrl } from "../data/categories";
import { filterByCategory, getVisiblePosts, pagedUrl, tagCounts, tagUrl, totalPages, type Post } from "./posts";
import { langPaths, otherLang } from "../i18n";

interface Group {
  key: string;
  name: string;
  /** 1페이지 주소 */
  base: string;
  posts: Post[];
}

/** 언어마다 묶음을 만들고, 묶음마다 페이지 수만큼 경로를 만든다 */
async function pagesFor(
  paramName: "slug" | "tag",
  groupsOf: (posts: Post[], lang: "ko" | "en") => Group[],
) {
  const perLang = await Promise.all(
    langPaths.map(async ({ params, props: { lang } }) => {
      const groups = groupsOf(await getVisiblePosts(lang), lang);
      const other = otherLang(lang);
      const otherGroups = new Map(groupsOf(await getVisiblePosts(other), other).map((g) => [g.key, g]));
      return groups.flatMap((g) => {
        const count = totalPages(g.posts.length, site.pageSize);
        const twin = otherGroups.get(g.key);
        const twinCount = twin ? totalPages(twin.posts.length, site.pageSize) : 0;
        return Array.from({ length: count }, (_, i) => {
          const page = i + 1;
          return {
            params: { ...params, [paramName]: g.key, ...(page > 1 ? { page: String(page) } : {}) },
            props: {
              lang,
              name: g.name,
              tag: g.key,
              posts: g.posts,
              page,
              base: g.base,
              alternate: twin && page <= twinCount ? pagedUrl(twin.base, page) : undefined,
            },
          };
        });
      });
    }),
  );
  return perLang.flat();
}

export const categoryPages = () =>
  pagesFor("slug", (posts, lang) =>
    categories
      .map((c) => ({ key: c.slug, name: categoryName(c, lang), base: categoryUrl(c.slug, lang), posts: filterByCategory(posts, c.slug) }))
      .filter((g) => g.posts.length > 0),
  );

export const tagPages = () =>
  pagesFor("tag", (posts, lang) =>
    tagCounts(posts).map(({ tag }) => ({ key: tag, name: `#${tag}`, base: tagUrl(tag, lang), posts: posts.filter((p) => p.data.tags.includes(tag)) })),
  );
