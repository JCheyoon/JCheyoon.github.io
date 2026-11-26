#!/usr/bin/env node
// 발행한 영어 글 중 linkedin: true인 글을 작성자의 LinkedIn 개인 피드에 올린다(SPEC §9.3).
// site.yml의 linkedin 작업이 배포가 성공한 뒤에 실행한다.
// 게시 기록은 git 태그 linkedin/<slug>다. master는 PR로만 바꿀 수 있어서 파일을 커밋하지 않는다.
// 확인만 하기(LinkedIn 호출과 태그 없음): SITE_URL=<사이트 주소> node scripts/post-linkedin.ts --dry-run
import { execFileSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { plainPostSchema, readPostSources, splitPost, type PostData } from "../src/lib/content-rules.ts";
import { localizePath } from "../src/i18n.ts";

export const tagName = (slug: string) => `linkedin/${slug}`;

/** 올릴 글: 영어, published, linkedin: true, 아직 태그가 없는 글 */
export function pendingPosts(root: string, postedTags: Set<string>): PostData[] {
  return readPostSources(root)
    .filter((source) => source.dirLang === "en")
    .flatMap((source) => {
      const split = splitPost(source.raw);
      if ("error" in split || split.front.linkedin !== true) return [];
      const post = plainPostSchema.parse(split.front);
      return post.status === "published" && !postedTags.has(tagName(post.slug)) ? [post] : [];
    });
}

export const articleUrl = (siteUrl: string, slug: string) => new URL(localizePath("en", `/post/${slug}/`), siteUrl).href;

/** 글 페이지의 대표 이미지. cover가 있는 글과 자동 생성 이미지(D12)를 사이트가 정한 대로 따른다 */
export const ogImage = (html: string) => html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];

/** Share on LinkedIn 문서의 링크 공유 요청. thumbnails가 없으면 LinkedIn이 카드에 이미지를 넣지 않는다 */
export function shareBody(post: PostData, url: string, personId: string, image: string) {
  return {
    author: `urn:li:person:${personId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: `${post.linkedin_text ?? `${post.title}\n\n${post.description}`}\n\n${url}` },
        shareMediaCategory: "ARTICLE",
        media: [
          { status: "READY", originalUrl: url, title: { text: post.title }, description: { text: post.description }, thumbnails: [{ url: image }] },
        ],
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };
}

const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8" });

function remoteTags(): Set<string> {
  const lines = git("ls-remote", "--tags", "--refs", "origin", "refs/tags/linkedin/*").split("\n").filter(Boolean);
  return new Set(lines.map((line) => line.split("refs/tags/")[1]));
}

/** 배포 직후에는 새 글이 잠시 404일 수 있다. 열리지 않는 주소는 올리지 않는다 */
async function fetchLivePage(url: string): Promise<string> {
  for (let attempt = 1; attempt <= 10; attempt++) {
    const response = await fetch(url);
    if (response.status === 200) return response.text();
    console.log(`${url} → ${response.status} (${attempt}/10)`);
    await sleep(30_000);
  }
  throw new Error(`${url}이 열리지 않아 게시하지 않았다`);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const { SITE_URL, LINKEDIN_ACCESS_TOKEN: token, LINKEDIN_PERSON_ID: personId } = process.env;
  if (!SITE_URL) throw new Error("SITE_URL이 필요하다");

  const posts = pendingPosts(".", dryRun ? new Set() : remoteTags());
  console.log(`LinkedIn에 올릴 글: ${posts.length}편`);
  if (posts.length === 0) return;
  if (!dryRun && (!token || !personId)) throw new Error("Secrets LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_ID가 필요하다");

  for (const post of posts) {
    const url = articleUrl(SITE_URL, post.slug);
    if (dryRun) {
      // 라이브 페이지를 받지 않으므로 이미지 주소 자리에는 표시만 넣는다
      console.log(JSON.stringify(shareBody(post, url, personId ?? "<LINKEDIN_PERSON_ID>", "<글 페이지의 og:image>"), null, 2));
      continue;
    }
    const image = ogImage(await fetchLivePage(url));
    if (!image) throw new Error(`${url}에 og:image가 없어 게시하지 않았다`);
    const body = shareBody(post, url, personId!, image);
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Restli-Protocol-Version": "2.0.0" },
      body: JSON.stringify(body),
    });
    if (response.status !== 201) throw new Error(`${post.slug} 게시 실패: ${response.status} ${await response.text()}`);

    const id = response.headers.get("x-restli-id") ?? "";
    const tag = tagName(post.slug);
    console.log(`게시함: ${post.slug} → https://www.linkedin.com/feed/update/${id}/`);
    try {
      git("-c", "user.name=github-actions[bot]", "-c", "user.email=41898282+github-actions[bot]@users.noreply.github.com",
        "tag", "-a", tag, "-m", `${id}\n${new Date().toISOString()}`);
      git("push", "origin", `refs/tags/${tag}`);
    } catch (error) {
      // 태그가 없으면 다음 배포에서 같은 글이 또 올라간다
      console.error(`${post.slug}은 이미 게시했지만 태그를 남기지 못했다. 다음 merge 전에 태그 ${tag}를 직접 push한다`);
      throw error;
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
