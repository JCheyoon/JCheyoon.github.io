// 카테고리의 단일 소스(SPEC §5.3). slug는 주소(/category/<slug>/)와 글 frontmatter의 category에 쓴다.
// 초기값은 2026-11-23 작성자 결정. 추가할 때는 이 목록만 고친다.
import { localizePath, type Lang } from "../i18n.ts";

export interface Category {
  slug: string;
  name: string;
  /** 영어 사이트(/en/)에 쓰는 이름 */
  nameEn: string;
  parent?: string;
  description?: string;
}

export const categories = [
  { slug: "ai", name: "AI 활용", nameEn: "Using AI" },
  { slug: "frontend", name: "프론트엔드", nameEn: "Frontend" },
  { slug: "backend", name: "백엔드", nameEn: "Backend" },
  { slug: "etc", name: "기타", nameEn: "Etc." },
] as const satisfies readonly Category[];

export type CategorySlug = (typeof categories)[number]["slug"];

export const categorySlugs = categories.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];

export function getCategory(slug: string): Category | undefined {
  return (categories as readonly Category[]).find((c) => c.slug === slug);
}

export function categoryName(category: Category, lang: Lang): string {
  return lang === "en" ? category.nameEn : category.name;
}

export function categoryUrl(slug: string, lang: Lang): string {
  return localizePath(lang, `/category/${slug}/`);
}

/** 해당 카테고리와 그 하위 카테고리의 slug 목록 (카테고리 페이지는 하위 카테고리 글도 포함한다) */
export function categoryWithChildren(slug: string): string[] {
  const list = categories as readonly Category[];
  return [slug, ...list.filter((c) => c.parent === slug).map((c) => c.slug)];
}
