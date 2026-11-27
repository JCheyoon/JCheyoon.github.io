// 사이트 정보의 단일 소스(SPEC §5.3). 작성자 이름, 사이트 이름, URL, 링크를 다른 곳에 하드코딩하지 않는다.
// url 값 자체는 astro.config.mjs의 SITE_URL에서 온다(import.meta.env.SITE).

export const site = {
  url: import.meta.env.SITE,
  name: "CHEYOON",
  // 언어별 문구(D11). 영어 문구는 작성자 검수 대상이다.
  description: {
    ko: "소프트웨어를 만들며 직접 겪은 문제와 해결을 기록하는 블로그입니다.",
    en: "A blog about problems I ran into while building software, and how I solved them.",
  },
  tagline: {
    ko: "소프트웨어를 만들며 배운 것을 기록합니다.",
    en: "Notes on what I learn building software.",
  },
  author: {
    name: "Jung Cheyoon",
  },
  social: [{ label: "GitHub", href: "https://github.com/JCheyoon" }],
  /** 문의 이메일(SPEC §6 문의). 문의·개인정보 처리방침 페이지가 쓴다 */
  email: "cheyoonka@gmail.com",
  /** Google Search Console 소유권 확인 값(HTML 태그 방식). 홈 head에 공개되는 값이라 비밀이 아니다. 지우면 소유권 확인이 풀릴 수 있다 */
  googleSiteVerification: "6Cuv7jZa2vNbZwFzTERLZxgo_l-LSMXnuNgVrJ33Kxw",
  /** 네이버 서치어드바이저 소유 확인 값(HTML 태그 방식). 홈 head에 공개되는 값이라 비밀이 아니다. 지우면 소유 확인이 풀릴 수 있다 */
  naverSiteVerification: "d25eba3d580609c10708f79d38a811247c3e7cf3",
  /** 댓글(giscus, D17). giscus.app이 만들어 주는 값이며 글 페이지에 공개된다 */
  giscus: {
    repo: "JCheyoon/JCheyoon.github.io",
    repoId: "R_kgDOQqdBmw",
    category: "Comments",
    categoryId: "DIC_kwDOQqdBm84DMDLe",
  },
  /** 글을 지정하지 않은 페이지의 OG 이미지 (public/ 기준 경로) */
  defaultOgImage: "/web-app-manifest-512x512.png",
  pageSize: 5,
} as const;
