---
title: Why I Moved My Blog from a React SPA to Astro
slug: why-astro
description: "Why I moved my personal blog from a React SPA to Astro: SSG over SSR, Astro over Next.js and Jekyll, and the trade-offs that came with it."
category: frontend
tags:
  - astro
  - ssg
status: published
lang: en
translated_from: ko
linkedin: false
ai_assisted: true
audience: Developers building a personal tech blog who are choosing between popular tools such as Next.js, Jekyll, and Astro
search_intent: I want to know whether SPA, SSR, or SSG fits a personal blog, and whether there is a reason to choose Astro
created_at: 2026-11-27
reviewed_at: 2026-11-27
reviewed_by: cheyoon
review_notes: 번역 검수 승인. 원문과 링크·코드 표기·제목 수 일치 확인, 표현은 번역 표현집 적용, B2 수준은 작성자 판단
published_at: 2026-11-27
updated_at:
disclosure:
cover:
  src: ../../../assets/posts/why-astro/cover.png
  alt: "Illustration of moving from a React SPA to Astro SSG: an arrow points from a React (SPA) window to an Astro (SSG) window, above a laptop with the GitHub logo"
---

After putting it off for ages, I finally decided to start building my GitHub blog again.
For a personal blog, I decided that **SSG** was the right choice. The biggest reason I picked Astro is that I can build both the site and the post checking tools in TypeScript, and they can share one rule file. In this post, I explain why I moved my blog from a React SPA to Astro, and why I didn't choose Next.js or Jekyll, two popular tools for blogs.

## First, some terms: rendering strategies and frameworks are different things

| Term | Meaning |
|---|---|
| SPA | An app structure. It starts with one page and changes the screen with JS |
| CSR | A rendering strategy. The browser creates the HTML with JS |
| SSR | The server creates the page when a request comes in |
| SSG | The build creates pages ahead of time, before deployment |
| ISR | Pages are created ahead of time, and the server rebuilds them at set intervals |

A framework is a tool that lets you choose and use these strategies. So below, I look at rendering strategies and tools separately.

## Why did I start with an SPA?

When I first built my blog, my candidates were Next.js and Jekyll. Many people say that Next.js server-side rendering is good for SEO, but I thought it was overkill for a personal blog with only static content. Also, the default Jekyll build on GitHub Pages limits versions and plugins, so it was hard to add the features I wanted ([GitHub Docs](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll)). So I chose Vite + a React SPA, which I had used a lot. At that time, I also wanted to practice backend development, so the browser requested posts from a backend I wrote in Go and rendered the page.

## 1. Why did I drop the SPA?

### Link previews

This was the deciding reason. I wanted a setup where I could have a post shared to LinkedIn automatically whenever I wanted. But my old setup served the same `index.html` for every URL, so I couldn't give each post its own title, description, and image in the Open Graph (OG) tags used for previews.

LinkedIn says that a share preview needs the `og:title`, `og:image`, `og:description`, and `og:url` tags ([LinkedIn Help](https://www.linkedin.com/help/linkedin/answer/a521928)).

Of course, you can solve this with an SPA too, by prerendering each URL or by having a CDN insert meta tags right before it sends the response. But I also had the reasons below, and the only reason to keep the old approach was that I didn't want to waste the time I'd already spent. Now that AI can rebuild it with a few prompts, it's no longer worth worrying about.

### No more reason to keep a server and a database

As I mentioned, I wanted to practice backend development at first. I built an admin page where I could write posts with TinyMCE and a backend API saved them to a database and loaded them back. But the running costs were a burden, so I looked for something free and found Supabase. On its free plan, however a project was paused if you didn't use it for a while. As of now, it is paused after one week without use ([Supabase pricing](https://supabase.com/pricing)). I even made a GitHub Actions workflow to stop that from happening.

By this point, I felt that apart from being backend practice, this setup didn't have much going for it. I could just practice on another project. I kept asking myself, "Why bother?".

So I decided to keep my posts as Markdown files in git. I got rid of the admin page where I logged in and wrote posts on the web, and I no longer needed a database. As a result, there were no more running costs and no server to maintain.

## 2. Why SSG instead of SSR?

I host this blog on GitHub Pages. GitHub Pages is static hosting that serves the HTML, CSS, and JS files in your repository as they are, so it doesn't run server code for each request ([GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)). Also, the content of this blog only changes when I merge a post, and there's no need to show different pages to different people. Since I would gain nothing from having a server, SSG, which needs no server, is the better choice.

## 3. Why Astro instead of Next.js?

In fact, Next.js can do SSG too! If you add `output: 'export'` to the config, it exports static files ([Next.js docs](https://nextjs.org/docs/app/guides/static-exports)). I still chose Astro for one reason.

- **Built-in post format checks:** In Astro, you register your posts folder and frontmatter rules (a schema), and the build raises an error when a post breaks the rules ([Astro docs](https://docs.astro.build/en/guides/content-collections/)). In Next.js, you have to build the same structure yourself with a library like zod.

## 4. Why Astro instead of Jekyll?

Jekyll's biggest strength is that GitHub Pages supports it by default. You just push to your repository, and GitHub builds it for you. But this default build has limits. It only builds with a fixed Jekyll version, and you can't use plugins that aren't on the allowed list.

To get around these limits, you have to build it yourself with GitHub Actions, and at that point Jekyll's biggest strength is gone. If I was going to use Actions anyway, I had no reason to stick with Jekyll.

So I decided to pick the tool that suited me better. With Astro, I can work in the JS/TS ecosystem I already know, so I don't need to set up a separate Ruby environment. I set up the build and deployment myself with Actions, which also gave me a chance to practice the deployment process again.

Most importantly, the site build, the post checking script, and the MCP server that creates posts all read the same TypeScript rule file. So when I change a rule in one place, it applies everywhere.

## 5. Why didn't I consider other tools?

I planned to use an MCP server to draft and check posts, so the site, the post checking script, and the MCP server had to read the same TypeScript rule file. That's why I ruled out tools built in other languages, such as Hugo or Zola.
As for the tools that work with TypeScript, here's how I narrowed them down.

- **Nuxt, SvelteKit, VitePress:** I would have to learn a new UI framework, Vue or Svelte. Astro components, on the other hand, use `{}` expressions on top of HTML, so I can write them much like the React syntax (JSX) I already know ([Astro docs](https://docs.astro.build/en/reference/astro-syntax/)).
- **Docusaurus:** It's based on React, which I know well, and it has a blog feature, but its focus is documentation sites. You change the design with CSS on top of the default theme, and to change the page structure in depth, you have to swizzle, which means replacing theme components with your own code ([Docusaurus docs](https://docusaurus.io/docs/swizzling)). You then have to keep those components working yourself when you update Docusaurus.

## The trade-offs of choosing SSG

| Trade-off | Where it stands now |
|---|---|
| Build time grows as I add more posts | Drawing a preview image for each post is an especially heavy step. There are few posts now, so it's not a problem |
| Even a single typo goes through a full build and deployment | The order is PR → merge → checks → deployment |
| No scheduled publishing | There's no setting that runs a build at a set time. I'd have to add one if I need it |
| Dynamic features are handled by outside tools | Search uses an index created at build time (Pagefind), and I plan to use Giscus for comments |

## Conclusion

The content of this blog only changes when I merge, it's served from static hosting, and its posts need preview cards. The biggest reason I chose Astro is that I can build the site and the tools in TypeScript and have them share one rule file. The trade-offs are build time, no scheduled publishing, and relying on outside tools for dynamic features.
