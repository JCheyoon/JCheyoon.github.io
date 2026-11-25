// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { satteri, satteriHeadingIdsPlugin } from "@astrojs/markdown-satteri";
import { callouts, headingAnchors } from "./src/lib/markdown.ts";

// SITE_URL은 canonical, sitemap, RSS, OG의 절대 URL을 만드는 유일한 기준이다(SPEC §4, §10).
// 도메인을 연결할 때(Phase 5) 이 값만 바꾸면 된다.
const SITE_URL = process.env.SITE_URL ?? "https://jcheyoon.github.io";

// INCLUDE_DRAFTS=true 빌드는 템플릿 검증용이다. draft·reviewed 글까지 만들고
// dist-drafts/에 따로 출력한다. 배포하는 빌드(dist/)에는 published 글만 들어간다.
const INCLUDE_DRAFTS = process.env.INCLUDE_DRAFTS === "true";

export default defineConfig({
  site: SITE_URL,
  // D5: 모든 페이지 주소는 끝 슬래시를 붙인다(/post/slug/).
  trailingSlash: "always",
  build: { format: "directory" },
  outDir: INCLUDE_DRAFTS ? "./dist-drafts" : "./dist",
  markdown: {
    // 본문 플러그인(SPEC §6.1). 제목 앵커는 heading id가 붙은 뒤에 돌아야 하므로 id 플러그인을 앞에 둔다.
    processor: satteri({
      mdastPlugins: [callouts],
      hastPlugins: [satteriHeadingIdsPlugin(), headingAnchors],
    }),
  },
  integrations: [
    // 코드 블록(SPEC §6.1): 빌드 때 HTML로 만든다. 복사 버튼만 작은 스크립트가 붙는다(SPEC §8).
    expressiveCode({
      // 라이트·다크 모두 어두운 코드 블록을 쓴다(SPEC §6.1)
      themes: ["github-dark"],
      plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
      defaultProps: {
        wrap: true,
        // 셸 세션은 줄 번호가 의미 없다(SPEC §5.6)
        overridesByLang: { shellsession: { showLineNumbers: false } },
      },
      styleOverrides: {
        borderRadius: "0.75rem",
        codeFontSize: "0.875rem",
        codeLineHeight: "1.5rem",
        frames: { shadowColor: "transparent" },
      },
    }),
    sitemap({
      filter: (page) => !new URL(page).pathname.startsWith("/404"),
      // 한국어 /x/와 영어 /en/x/가 둘 다 있으면 서로를 대체 언어로 넣는다(SPEC §9.2)
      i18n: { defaultLocale: "ko", locales: { ko: "ko", en: "en" } },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    define: {
      __INCLUDE_DRAFTS__: JSON.stringify(INCLUDE_DRAFTS),
    },
  },
});
