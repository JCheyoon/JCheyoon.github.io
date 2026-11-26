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
    try {
      const response = await fetch(url);
      if (response.status === 200) return await response.text();
      console.log(`${url} → ${response.status} (${attempt}/10)`);
    } catch (error) {
      // 배포 직후의 DNS 오류나 연결 끊김도 다시 시도한다
      console.log(`${url} → ${(error as Error).message} (${attempt}/10)`);
    }
    await sleep(30_000);
  }
  throw new Error(`${url}이 열리지 않아 게시하지 않았다`);
}

/** 게시 기록을 남기는 명령. 자동 기록이 실패했거나 결과를 알 수 없을 때 사람이 실행한다 */
const tagCommands = (tag: string) =>
  `  git fetch origin master\n  git tag -a ${tag} -m "<게시물 주소>" origin/master\n  git push origin refs/tags/${tag}`;

/** LinkedIn에 올라갔는지 알 수 없거나, 올라갔는데 기록이 없다. 그대로 다시 실행하면 두 번 올라갈 수 있다 */
const duplicateWarning = (tag: string) =>
  `LinkedIn 개인 피드를 먼저 확인한다. 올라가 있으면 아래 태그를 push하기 전에는 Re-run도 다음 merge도 하지 않는다.\n${tagCommands(tag)}`;

/** 태그를 남기지 못했다. 원인이 같으면 다음 글도 기록이 남지 않으므로 더 올리지 않는다 */
class RecordError extends Error {}

async function publish(post: PostData, url: string, token: string, personId: string) {
  const image = ogImage(await fetchLivePage(url));
  if (!image) throw new Error(`${url}에 og:image가 없어 게시하지 않았다`);

  const tag = tagName(post.slug);
  let response: Response;
  try {
    response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Restli-Protocol-Version": "2.0.0" },
      body: JSON.stringify(shareBody(post, url, personId, image)),
    });
  } catch (error) {
    throw new Error(`게시 요청의 응답을 받지 못했다(${(error as Error).message}).\n${duplicateWarning(tag)}`);
  }
  if (response.status !== 201) {
    const reason = `게시 실패: ${response.status} ${await response.text().catch(() => "")}`;
    // 4xx는 LinkedIn이 거부한 것이라 올라가지 않았다
    throw new Error(response.status >= 400 && response.status < 500 ? reason : `${reason}\n${duplicateWarning(tag)}`);
  }

  const id = response.headers.get("x-restli-id") ?? "";
  console.log(`게시함: ${post.slug} → https://www.linkedin.com/feed/update/${id}/`);
  try {
    git("-c", "user.name=github-actions[bot]", "-c", "user.email=41898282+github-actions[bot]@users.noreply.github.com",
      "tag", "-a", tag, "-m", `${id}\n${new Date().toISOString()}`);
    git("push", "origin", `refs/tags/${tag}`);
  } catch (error) {
    throw new RecordError(`게시했지만 태그를 남기지 못했다(${(error as Error).message}).\n${duplicateWarning(tag)}`);
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const { SITE_URL, LINKEDIN_ACCESS_TOKEN: token, LINKEDIN_PERSON_ID: personId } = process.env;
  if (!SITE_URL) throw new Error("SITE_URL이 필요하다");

  const posts = pendingPosts(".", dryRun ? new Set() : remoteTags());
  console.log(`LinkedIn에 올릴 글: ${posts.length}편`);
  if (posts.length === 0) return;
  if (dryRun) {
    for (const post of posts) {
      // 라이브 페이지를 받지 않으므로 이미지 주소 자리에는 표시만 넣는다
      const body = shareBody(post, articleUrl(SITE_URL, post.slug), personId ?? "<LINKEDIN_PERSON_ID>", "<글 페이지의 og:image>");
      console.log(JSON.stringify(body, null, 2));
    }
    return;
  }
  if (!token || !personId) throw new Error("Secrets LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_ID가 필요하다");

  // 한 글이 실패해도 다음 글은 올린다. 실패한 글이 있으면 작업은 실패로 끝낸다
  const failed: string[] = [];
  for (const post of posts) {
    try {
      await publish(post, articleUrl(SITE_URL, post.slug), token, personId);
    } catch (error) {
      console.error(`${post.slug}: ${(error as Error).message}`);
      failed.push(post.slug);
      if (error instanceof RecordError) break;
    }
  }
  if (failed.length > 0) throw new Error(`LinkedIn 게시에 실패한 글: ${failed.join(", ")}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
