// 글 frontmatter 스키마(SPEC §5.1)와 빌드 실패 조건(SPEC §5.2 중 frontmatter로 판단할 수 있는 것).
// 본문을 봐야 하는 검사(보완 표시, 제휴 링크, 이미지 alt, slug=파일명)는 scripts/check-content.mjs가 한다.
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { categorySlugs } from "./data/categories";

const LANGS = ["ko", "en"] as const;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// YAML에서 `reviewed_at:`처럼 값을 비워 두면 null이 된다. 비어 있음은 undefined로 통일한다.
const emptyToUndefined = (v: unknown) => (v === null || v === "" ? undefined : v);
const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());
const optionalText = z.preprocess(emptyToUndefined, z.string().min(1).optional());

const posts = defineCollection({
  loader: glob({
    // 한국어 글은 posts/<slug>.md, 영어 글은 posts/en/<slug>.md (SPEC §9.2)
    pattern: ["*.md", "en/*.md"],
    base: "./src/content/posts",
    // 글 id는 경로로 정한다(한국어 `<slug>`, 영어 `en/<slug>`). 원문과 번역본이 같은 slug를 써도 겹치지 않는다.
    // frontmatter slug가 파일명과 같은지, lang이 폴더와 맞는지는 check-content가 확인한다.
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        slug: z.string().regex(SLUG_PATTERN, "slug는 영문 소문자, 숫자, 하이픈만 쓴다"),
        description: z.string().min(1),
        category: z.enum(categorySlugs),
        tags: z
          .array(z.string().min(1).refine((t) => t === t.toLowerCase(), "태그는 소문자로 쓴다"))
          .default([]),
        status: z.enum(["draft", "reviewed", "published"]),
        lang: z.enum(LANGS).default("ko"),
        translated_from: z.enum(LANGS).optional(),
        ai_assisted: z.boolean(),
        audience: z.string().min(1),
        search_intent: z.string().min(1),
        created_at: z.coerce.date(),
        reviewed_at: optionalDate,
        reviewed_by: optionalText,
        review_notes: optionalText,
        published_at: optionalDate,
        updated_at: optionalDate,
        disclosure: optionalText,
        sources: z
          .array(
            z.object({
              title: z.string().min(1),
              url: z.url(),
              accessed: z.coerce.date(),
            }),
          )
          .default([]),
        cover: z
          .object({
            src: image(),
            alt: z.string().min(1, "cover 이미지에는 alt가 필요하다"),
          })
          .optional(),
      })
      .superRefine((data, ctx) => {
        if (data.translated_from !== undefined) {
          if (data.translated_from === data.lang) {
            ctx.addIssue({ code: "custom", path: ["translated_from"], message: "translated_from은 글의 lang과 달라야 한다" });
          }
          if (!data.ai_assisted) {
            ctx.addIssue({ code: "custom", path: ["ai_assisted"], message: "번역본은 AI 초안이므로 ai_assisted: true다 (SPEC §9.2)" });
          }
        }
        if (data.status !== "draft") {
          for (const field of ["reviewed_at", "reviewed_by", "review_notes"] as const) {
            if (data[field] === undefined) {
              ctx.addIssue({
                code: "custom",
                path: [field],
                message: `status가 ${data.status}이면 ${field}가 필요하다 (review-post 승인 기록)`,
              });
            }
          }
        }
        if (data.status === "published" && data.published_at === undefined) {
          ctx.addIssue({
            code: "custom",
            path: ["published_at"],
            message: "status가 published이면 published_at이 필요하다 (publish-post 기록)",
          });
        }
      }),
});

export const collections = { posts };
