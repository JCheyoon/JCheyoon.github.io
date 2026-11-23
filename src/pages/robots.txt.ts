import type { APIRoute } from "astro";
import { site } from "../site.config";

export const GET: APIRoute = () => {
  const sitemap = new URL("sitemap-index.xml", site.url).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
