// 사이트 정보의 단일 소스(SPEC §5.3). 작성자 이름, 사이트 이름, URL, 링크를 다른 곳에 하드코딩하지 않는다.
// url 값 자체는 astro.config.mjs의 SITE_URL에서 온다(import.meta.env.SITE).

export const site = {
  url: import.meta.env.SITE,
  name: "CHEYOON",
  description: "소프트웨어를 만들며 직접 겪은 문제와 해결을 기록하는 블로그입니다.",
  tagline: "소프트웨어를 만들며 배운 것을 기록합니다.",
  author: {
    name: "Jung Cheyoon",
  },
  social: [{ label: "GitHub", href: "https://github.com/JCheyoon" }],
  /** 글을 지정하지 않은 페이지의 OG 이미지 (public/ 기준 경로) */
  defaultOgImage: "/web-app-manifest-512x512.png",
  pageSize: 10,
} as const;
