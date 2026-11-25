// 언어별 화면 문구와 주소 규칙의 단일 소스(SPEC §9.2, D11).
// 한국어 사이트는 루트(/), 영어 사이트는 /en/ 아래에 같은 구조로 둔다.

export const LANGS = ["ko", "en"] as const;
export type Lang = (typeof LANGS)[number];

/** 루트 기준 주소(`/`, `/post/a/`)를 그 언어의 주소로 바꾼다. 영어는 앞에 /en을 붙인다. */
export function localizePath(lang: Lang, path: string): string {
  return lang === "en" ? `/en${path}` : path;
}

export function otherLang(lang: Lang): Lang {
  return lang === "ko" ? "en" : "ko";
}

/**
 * 한 라우트 파일로 두 언어 페이지를 만들 때 쓰는 getStaticPaths 값.
 * `src/pages/[...lang]/`의 lang이 비면 한국어(루트), "en"이면 영어(/en/)다.
 */
export const langPaths = LANGS.map((lang) => ({
  params: { lang: lang === "ko" ? undefined : lang },
  props: { lang },
}));

export const ui = {
  ko: {
    htmlLang: "ko",
    ogLocale: "ko_KR",
    /** 언어 전환 링크에 보이는 이 언어의 이름 */
    langName: "한국어",
    langSwitch: "한국어로 보기",
    dateLocale: "ko-KR",
    skipToContent: "본문으로 건너뛰기",
    mainMenu: "주 메뉴",
    home: "홈",
    about: "소개",
    sidebar: "사이드바",
    categories: "카테고리",
    allPosts: "전체 글",
    postCount: (n: number) => `글 ${n}편`,
    noPosts: "아직 발행된 글이 없습니다.",
    listPageTitle: (page: number) => `글 목록 ${page}페이지`,
    listPageHeading: (page: number) => `전체 글 · ${page}페이지`,
    listPageDescription: (siteName: string, page: number) => `${siteName}의 글 목록 ${page}페이지입니다.`,
    categoryDescription: (siteName: string, name: string, n: number) => `${siteName}의 ${name} 카테고리 글 ${n}편입니다.`,
    pagination: "페이지",
    prev: "이전",
    next: "다음",
    draftBadge: "초안",
    draftNotice: (status: string) => `초안 미리보기입니다(status: ${status}). 배포 빌드에는 포함되지 않습니다.`,
    updated: "수정",
    sources: "참고한 자료",
    accessed: (date: string) => `${date} 확인`,
    tags: "태그",
    prevNextNav: "이전 글과 다음 글",
    prevPost: "이전 글",
    breadcrumb: "현재 위치",
    toc: "목차",
    backToTop: "맨 위로",
    nextPost: "다음 글",
  },
  en: {
    htmlLang: "en",
    ogLocale: "en_US",
    langName: "English",
    langSwitch: "View in English",
    dateLocale: "en-US",
    skipToContent: "Skip to content",
    mainMenu: "Main menu",
    home: "Home",
    about: "About",
    sidebar: "Sidebar",
    categories: "Categories",
    allPosts: "All posts",
    postCount: (n: number) => (n === 1 ? "1 post" : `${n} posts`),
    noPosts: "No posts yet.",
    listPageTitle: (page: number) => `Posts, page ${page}`,
    listPageHeading: (page: number) => `All posts · Page ${page}`,
    listPageDescription: (siteName: string, page: number) => `Page ${page} of the ${siteName} post list.`,
    categoryDescription: (siteName: string, name: string, n: number) =>
      `${n === 1 ? "1 post" : `${n} posts`} in ${name} on ${siteName}.`,
    pagination: "Pagination",
    prev: "Previous",
    next: "Next",
    draftBadge: "Draft",
    draftNotice: (status: string) => `Draft preview (status: ${status}). Not included in the deployed build.`,
    updated: "Updated",
    sources: "Sources",
    accessed: (date: string) => `accessed ${date}`,
    tags: "Tags",
    prevNextNav: "Previous and next posts",
    prevPost: "Previous post",
    breadcrumb: "Breadcrumb",
    toc: "On this page",
    backToTop: "Back to top",
    nextPost: "Next post",
  },
} as const;
