// 코드 블록 설정(SPEC §6.1). .astro 페이지의 <Code> 컴포넌트도 이 설정을 쓰려면 별도 파일이어야 한다.
import { defineEcConfig } from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";

export default defineEcConfig({
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
});
