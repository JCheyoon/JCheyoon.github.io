import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { site } from "../site.config";
import { getCategory } from "../data/categories";
import { getVisiblePosts, postDate, postUrl } from "../lib/posts";

export const GET: APIRoute = async () => {
  const posts = await getVisiblePosts();
  return rss({
    title: site.name,
    description: site.description,
    site: site.url,
    trailingSlash: true,
    customData: "<language>ko</language>",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: postDate(post),
      link: postUrl(post),
      categories: [getCategory(post.data.category)?.name ?? post.data.category],
    })),
  });
};
