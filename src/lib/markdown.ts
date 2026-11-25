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

// `[!TIP]` 뒤 같은 줄은 제목, 줄바꿈 뒤는 본문이다. GitHub처럼 대소문자를 가리지 않는다.
const MARKER = new RegExp(`^\\[!(${CALLOUT_TYPES.join("|")})\\][ \\t]*`, "i");

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** 인라인 노드의 글자만 모은다(제목은 서식 없이 글자로 보여 준다) */
type Inline = { type: string; value?: string; children?: Inline[] };
const textOf = (node: Inline): string => node.value ?? (node.children ?? []).map(textOf).join("");

export const callouts = defineMdastPlugin({
  name: "blog-callouts",
  blockquote(node, ctx) {
    const [first, ...restBlocks] = node.children;
    if (first?.type !== "paragraph") return;
    const [head] = first.children;
    if (head?.type !== "text") return;
    const match = head.value.match(MARKER);
    if (!match) return;

    // 표시를 뺀 첫 문단에서, 첫 줄바꿈(글자 속 \n 또는 강제 줄바꿈)까지가 제목이다.
    // 제목에 `코드`나 **굵게**가 섞여도 잘리지 않게 줄바꿈 전 인라인 노드를 모두 모은다.
    const inline = [{ ...head, value: head.value.slice(match[0].length) }, ...first.children.slice(1)];
    const titleNodes: Inline[] = [];
    let bodyInline: typeof inline = [];
    for (let i = 0; i < inline.length; i++) {
      const child = inline[i];
      if (child.type === "break") {
        bodyInline = inline.slice(i + 1);
        break;
      }
      if (child.type === "text" && child.value.includes("\n")) {
        const cut = child.value.indexOf("\n");
        titleNodes.push({ type: "text", value: child.value.slice(0, cut) });
        const rest = child.value.slice(cut + 1);
        bodyInline = [...(rest ? [{ ...child, value: rest }] : []), ...inline.slice(i + 1)];
        break;
      }
      titleNodes.push(child);
    }

    const type = match[1].toUpperCase() as CalloutType;
    const lang = ctx.fileURL?.pathname.includes("/posts/en/") ? "en" : "ko";
    const title = titleNodes.map(textOf).join("").trim() || CALLOUT_LABELS[lang][type];
    const body = bodyInline.length > 0 ? [{ ...first, children: bodyInline }, ...restBlocks] : restBlocks;

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
