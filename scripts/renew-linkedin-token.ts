#!/usr/bin/env node
// LinkedIn 토큰을 새로 발급한 뒤 GitHub에 반영한다(SPEC §9.3). 작성자 컴퓨터(macOS)에서만 실행한다: npm run linkedin:token
// 공개 저장소다. 토큰과 계정 ID는 파일에 쓰지 않고 출력하지 않는다.
// 명령 인자는 다른 프로세스와 셸 기록에 보이므로, gh에는 표준 입력으로 넘긴다.
import { execFileSync } from "node:child_process";
import { createInterface } from "node:readline/promises";

const run = (command: string, args: string[], input = "") =>
  execFileSync(command, args, { input, encoding: "utf8", stdio: ["pipe", "pipe", "inherit"] });

async function main() {
  run("gh", ["auth", "status"]);
  const repo = run("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]).trim();

  // 터미널 입력이 닫히면(Ctrl+D, 파이프) 아무것도 바꾸지 않는다
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  const closed = new AbortController();
  prompt.once("close", () => closed.abort());
  const ask = (text: string) =>
    prompt.question(text, { signal: closed.signal }).catch(() => {
      throw new Error("입력이 끊겨 바꾸지 않았다");
    });
  // 토큰을 읽은 뒤에는 어떻게 끝나든 클립보드에 남기지 않는다
  let tokenOnClipboard = false;
  try {
    await ask(
      "1. https://www.linkedin.com/developers/tools/oauth/token-generator 에서 openid, profile, w_member_social로 새 토큰을 발급한다(발급한 당일에 반영한다).\n" +
        "2. 토큰을 복사한 뒤 여기서 Enter를 누른다(붙여 넣지 않는다). ",
    );
    const token = run("pbpaste", []).trim();
    // 값 자체는 오류 메시지에도 넣지 않는다
    if (!/^[\x21-\x7e]{100,2000}$/.test(token)) {
      throw new Error(`클립보드의 값(${token.length}자)이 토큰 모양이 아니다. 토큰을 복사하고 다시 실행한다`);
    }

    tokenOnClipboard = true;

    const response = await fetch("https://api.linkedin.com/v2/userinfo", { headers: { Authorization: `Bearer ${token}` } });
    if (response.status !== 200) throw new Error(`LinkedIn이 토큰을 받지 않았다(${response.status}). 새로 발급해 다시 실행한다`);
    const { sub, name } = (await response.json()) as { sub?: string; name?: string };
    if (!sub) throw new Error("LinkedIn 응답에 계정 ID(sub)가 없다. openid, profile 권한을 확인한다");

    const answer = await ask(`3. LinkedIn 계정 "${name}"의 토큰이다. 본인이면 y: ${repo}의 Actions 설정을 바꿀까? (y/N) `);
    if (answer.trim().toLowerCase() !== "y") return console.log("바꾸지 않았다.");

    run("gh", ["secret", "set", "LINKEDIN_ACCESS_TOKEN", "--repo", repo], token);
    // 같은 앱이면 ID는 그대로다. GitHub의 Secret은 읽을 수 없어 비교하지 않고 매번 덮어쓴다
    run("gh", ["secret", "set", "LINKEDIN_PERSON_ID", "--repo", repo], sub);
    // 만료 알림(linkedin-token.yml)이 이 날짜로 계산한다. 토큰은 오늘 발급했다고 본다
    const today = new Intl.DateTimeFormat("en-CA").format(new Date());
    run("gh", ["variable", "set", "LINKEDIN_TOKEN_ISSUED_AT", "--repo", repo, "--body", today]);

    console.log(`완료: Secrets 2개와 Variable LINKEDIN_TOKEN_ISSUED_AT=${today}를 저장했다.\n클립보드 기록 앱을 쓰면 그 기록은 직접 지운다. 만료 알림 이슈가 열려 있으면 닫는다.`);
  } finally {
    if (tokenOnClipboard) {
      run("pbcopy", []);
      console.log("클립보드를 비웠다.");
    }
    prompt.close();
  }
}

await main().catch((error: Error) => {
  console.error(`중단: ${error.message}`);
  process.exitCode = 1;
});
