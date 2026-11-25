import type { APIRoute } from "astro";
import { langFeed } from "../../lib/rss";

export const GET: APIRoute = () => langFeed("en");
