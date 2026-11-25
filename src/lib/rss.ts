import rss from "@astrojs/rss";
import { site } from "../site.config";
import { categoryName, getCategory } from "../data/categories";
import { getVisiblePosts, postDate, postUrl } from "./posts";
import { ui, type Lang } from "../i18n";

/** 언어별 RSS. /rss.xml은 한국어 글만, /en/rss.xml은 영어 글만 담는다(SPEC §4). */
export async function langFeed(lang: Lang): Promise<Response> {
  const posts = await getVisiblePosts(lang);
  return rss({
    title: site.name,
    description: site.description[lang],
    site: site.url,
    trailingSlash: true,
    customData: `<language>${ui[lang].htmlLang}</language>`,
    items: posts.map((post) => {
      const category = getCategory(post.data.category);
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: postDate(post),
        link: postUrl(post),
        categories: [category ? categoryName(category, lang) : post.data.category],
      };
    }),
  });
}
