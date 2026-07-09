import { createDb } from "~/lib/db/client";
import { listPublished } from "~/lib/posts/repository";
import { escapeXml } from "~/lib/xml";
import type { Route } from "./+types/rss";

const RSS_ITEM_LIMIT = 30;
const RSS_EXCERPT_LENGTH = 300;

export async function loader({ context }: Route.LoaderArgs) {
	const db = createDb(context.cloudflare.env.DB);
	const siteUrl = context.cloudflare.env.SITE_URL.replace(/\/$/, "");
	const posts = await listPublished(db, { limit: RSS_ITEM_LIMIT });

	const items = posts
		.map((p) => {
			const link = `${siteUrl}/post/${p.slug}`;
			const description = p.bodyVi.replace(/\s+/g, " ").trim().slice(0, RSS_EXCERPT_LENGTH);
			const pubDate = (p.publishedAt ?? new Date()).toUTCString();
			return `    <item>
      <title>${escapeXml(p.titleVi)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
		})
		.join("\n");

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>RedditVN</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>Reddit hay, đọc bằng tiếng Việt</description>
    <language>vi</language>
${items}
  </channel>
</rss>`;

	return new Response(body, {
		headers: {
			"content-type": "application/rss+xml; charset=utf-8",
			"cache-control": "public, max-age=1800",
		},
	});
}
