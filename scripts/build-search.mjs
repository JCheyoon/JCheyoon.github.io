#!/usr/bin/env node
// 검색 색인(SPEC §6.3, D16). 빌드 결과물의 글 페이지만 Pagefind로 색인한다.
// 공개 글이 하나도 없으면 Pagefind가 실패하므로 건너뛴다(그때 검색 창은 "지금은 검색을 쓸 수 없습니다"를 보인다).
// 사용법: node scripts/build-search.mjs dist | dist-drafts
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const site = process.argv[2] ?? "dist";
const hasPosts = ["post", join("en", "post")].some((dir) => existsSync(join(site, dir)));
if (!hasPosts) {
  console.log(`build-search: ${site}에 글 페이지가 없어 검색 색인을 건너뛴다`);
  process.exit(0);
}
const { status } = spawnSync("npx", ["pagefind", "--site", site, "--glob", "{post,en/post}/**/*.html"], { stdio: "inherit" });
process.exit(status ?? 1);
