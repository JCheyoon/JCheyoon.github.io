// OG 이미지(D12, SPEC §5.4). cover가 없는 글마다 빌드할 때 1200×630 PNG를 만든다.
// satori로 그림을 SVG로 그리고 resvg로 PNG로 바꾼다. 색과 모양은 사이트(연청록 배경, 흰 카드, 로고 청록)와 맞춘다.
import { readFileSync } from "node:fs";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

// Pretendard(OFL, src/assets/fonts/Pretendard-LICENSE.txt). 빌드할 때 한 번만 읽는다.
const fonts = [
  { name: "Pretendard", weight: 700 as const, style: "normal" as const, data: readFileSync("src/assets/fonts/Pretendard-Bold.otf") },
  { name: "Pretendard", weight: 500 as const, style: "normal" as const, data: readFileSync("src/assets/fonts/Pretendard-Medium.otf") },
];

// 그림에는 CSS 변수를 쓸 수 없어서 라이트 테마 토큰(global.css)의 값을 옮겨 적는다(site-code.md 예외).
// 토큰 값을 바꾸면 여기도 함께 바꾼다.
const COLORS = {
  background: "#e9f2f1", // --background
  card: "#ffffff", // --card
  foreground: "#0b1220", // --foreground
  muted: "#5a6372", // --muted-foreground
  accent: "#5f9e9f", // --logo(로고 청록)
  chip: "#e3efef", // --accent-bar 14% 섞은 배경(.meta-icon)
};


export interface OgInput {
  title: string;
  category: string;
  date: string;
  /** 글쓴이. 누가 썼는지 공유 미리보기에도 보이게 한다 */
  author: string;
}

type Node = { type: string; props: Record<string, unknown> & { children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});

export async function renderOgImage({ title, category, date, author }: OgInput): Promise<Buffer> {
  const tree = h(
    "div",
    // 바깥 여백 56px. satori는 100% + padding을 넘치게 계산해서 카드 크기를 고정값으로 준다
    { display: "flex", alignItems: "center", justifyContent: "center", width: 1200, height: 630, backgroundColor: COLORS.background, fontFamily: "Pretendard" },
    h(
      "div",
      {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        // satori는 width·height에 padding을 더해 그린다(content-box). 카드 바깥 크기가 1088×518이 되게 뺀다
        width: 1200 - 56 * 2 - 64 * 2,
        height: 630 - 56 * 2 - 56 * 2,
        padding: "56px 64px",
        backgroundColor: COLORS.card,
        borderRadius: 40,
      },
      [
        h("div", { display: "flex", flexDirection: "column", gap: 28 }, [
          // 카테고리 칩
          h(
            "div",
            { display: "flex" },
            h("div", { display: "flex", padding: "8px 20px", borderRadius: 14, backgroundColor: COLORS.chip, color: COLORS.accent, fontSize: 28, fontWeight: 700 }, category),
          ),
          // 제목: 왼쪽 강조 막대, 최대 3줄
          h("div", { display: "flex", position: "relative", paddingLeft: 36 }, [
            h("div", { position: "absolute", left: 0, top: 12, width: 10, height: 46, borderRadius: 5, backgroundColor: COLORS.accent }),
            h(
              "div",
              { fontSize: 56, fontWeight: 700, lineHeight: 1.3, color: COLORS.foreground, lineClamp: 3, wordBreak: "keep-all" },
              title,
            ),
          ]),
        ]),
        // 아래: 글쓴이와 날짜
        h("div", { display: "flex", alignItems: "center", justifyContent: "space-between" }, [
          h("div", { fontSize: 32, fontWeight: 700, color: COLORS.foreground }, author),
          h("div", { fontSize: 30, fontWeight: 500, color: COLORS.muted }, date),
        ]),
      ],
    ),
  );

  const svg = await satori(tree as never, { width: 1200, height: 630, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
}
