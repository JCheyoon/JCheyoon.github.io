// 본문 Markdown 플러그인(SPEC §5.6, §6.1). Astro 기본 처리기인 Sätteri의 플러그인 API를 쓴다.
// - 안내 상자: GitHub 문법 `> [!NOTE] 제목`을 <aside class="callout">로 바꾼다.
// - 제목 앵커: h2~h4 끝에 `#` 링크를 붙인다. id는 Astro의 heading id 플러그인이 먼저 붙인다.
import { defineHastPlugin, defineMdastPlugin } from "satteri";

const CALLOUT_TYPES = ["NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"] as const;
type CalloutType = (typeof CALLOUT_TYPES)[number];

/** 제목을 쓰지 않았을 때 보이는 종류 이름. 글 언어(posts/en/ 여부)에 맞춘다. */
const CALLOUT_LABELS: Record<"ko" | "en", Record<CalloutType, string>> = {
  ko: { NOTE: "참고", TIP: "팁", IMPORTANT: "중요", WARNING: "주의", CAUTION: "위험" },
  en: { NOTE: "Note", TIP: "Tip", IMPORTANT: "Important", WARNING: "Warning", CAUTION: "Caution" },
};

// `[!TIP]` 뒤 같은 줄의 글자는 제목, 줄바꿈 뒤는 본문이다.
const MARKER = new RegExp(`^\\[!(${CALLOUT_TYPES.join("|")})\\][ \\t]*([^\\n]*)\\n?`);

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const callouts = defineMdastPlugin({
  name: "blog-callouts",
  blockquote(node, ctx) {
    const [first, ...restBlocks] = node.children;
    if (first?.type !== "paragraph") return;
    const [head, ...restInline] = first.children;
    if (head?.type !== "text") return;
    const match = head.value.match(MARKER);
    if (!match) return;

    const type = match[1] as CalloutType;
    const lang = ctx.fileURL?.pathname.includes("/posts/en/") ? "en" : "ko";
    const title = match[2].trim() || CALLOUT_LABELS[lang][type];

    // 표시 줄을 뺀 첫 문단. 남는 글자가 없으면 문단을 통째로 뺀다.
    const remaining = head.value.slice(match[0].length);
    const inline = remaining ? [{ ...head, value: remaining }, ...restInline] : restInline;
    const body = inline.length > 0 ? [{ ...first, children: inline }, ...restBlocks] : restBlocks;

    const kind = type.toLowerCase();
    ctx.replaceNode(node, [
      { type: "html", value: `<aside class="callout callout-${kind}"><p class="callout-title">${escapeHtml(title)}</p>` },
      ...body,
      { type: "html", value: "</aside>" },
    ]);
  },
});

export const headingAnchors = defineHastPlugin({
  name: "blog-heading-anchors",
  element: {
    filter: ["h2", "h3", "h4"],
    visit(node, ctx) {
      const id = node.properties?.id;
      if (typeof id !== "string" || !id) return;
      // 화면에서는 마우스를 올릴 때만 보이는 장식이다. 제목 id 자체로 링크할 수 있으므로 보조 기술에서는 숨긴다.
      // `#` 글자는 CSS로 그린다. 글자로 넣으면 목차에 쓰는 제목 텍스트에 섞인다.
      ctx.appendChild(node, {
        type: "element",
        tagName: "a",
        properties: { href: `#${id}`, className: ["heading-anchor"], ariaHidden: "true", tabIndex: -1 },
        children: [],
      });
    },
  },
});
