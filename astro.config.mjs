// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

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
  integrations: [
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
