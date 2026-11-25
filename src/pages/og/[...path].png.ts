// 글 OG 이미지(D12). cover가 없는 공개 글마다 빌드할 때 PNG를 만든다.
// 한국어 /og/<slug>.png, 영어 /og/en/<slug>.png. 글 페이지의 og:image가 이 주소를 가리킨다(posts.ts ogImageUrl).
import type { APIRoute, GetStaticPaths } from "astro";
import { site } from "../../site.config";
import { categoryName, getCategory } from "../../data/categories";
import { formatDate, getVisiblePosts, ogImagePath, postDate, type Post } from "../../lib/posts";
import { renderOgImage } from "../../lib/og";
import { LANGS } from "../../i18n";

export const getStaticPaths = (async () => {
  const perLang = await Promise.all(LANGS.map((lang) => getVisiblePosts(lang)));
  return perLang
    .flat()
    .filter((post) => !post.data.cover)
    .map((post) => ({ params: { path: ogImagePath(post) }, props: { post } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ post: Post }> = async ({ props: { post } }) => {
  const { lang } = post.data;
  const category = getCategory(post.data.category);
  const png = await renderOgImage({
    title: post.data.title,
    category: category ? categoryName(category, lang) : post.data.category,
    date: formatDate(postDate(post), lang),
    author: site.author.name,
  });
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
