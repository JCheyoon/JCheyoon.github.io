// 공개 글 데이터(SPEC D18). blog-backend의 공개 MCP 서버가 이 파일 하나를 받아 검색·본문 제공에 쓴다.
// 글 목록은 getVisiblePosts()로 가져오므로 배포 빌드에는 published 글만, 템플릿 검증 빌드에는 샘플 초안까지 들어간다.
// 한국어·영어 글을 한 파일에 담고 lang으로 구분한다. 본문은 frontmatter를 뺀 Markdown 원문이다.
import type { APIRoute } from "astro";
import { site } from "../../site.config";
import { categoryName, getCategory } from "../../data/categories";
import { LANGS, otherLang } from "../../i18n";
import { getVisiblePosts, isoDate, postDate, postUrl, type Post } from "../../lib/posts";

const absolute = (path: string) => new URL(path, site.url).href;

export const GET: APIRoute = async () => {
  const byLang = Object.fromEntries(await Promise.all(LANGS.map(async (lang) => [lang, await getVisiblePosts(lang)] as const)));

  const toItem = (post: Post) => {
    const { data } = post;
    const category = getCategory(data.category);
    const translation = byLang[otherLang(data.lang)].find((p) => p.data.slug === data.slug);
    return {
      slug: data.slug,
      lang: data.lang,
      url: absolute(postUrl(post)),
      title: data.title,
      description: data.description,
      category: { slug: data.category, name: category ? categoryName(category, data.lang) : data.category },
      tags: data.tags,
      publishedAt: isoDate(postDate(post)),
      updatedAt: data.updated_at ? isoDate(data.updated_at) : null,
      translations: translation ? { [translation.data.lang]: absolute(postUrl(translation)) } : {},
      body: post.body ?? "",
    };
  };

  const body = {
    generatedAt: new Date().toISOString(),
    site: site.url,
    posts: LANGS.flatMap((lang) => byLang[lang].map(toItem)),
  };
  return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json; charset=utf-8" } });
};
