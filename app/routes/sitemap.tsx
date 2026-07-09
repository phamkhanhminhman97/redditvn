import { CATEGORIES } from "~/lib/categories";
import { createDb } from "~/lib/db/client";
import { listPublished } from "~/lib/posts/repository";
import { escapeXml } from "~/lib/xml";
import type { Route } from "./+types/sitemap";

export async function loader({ context }: Route.LoaderArgs) {
	const db = createDb(context.cloudflare.env.DB);
	const siteUrl = context.cloudflare.env.SITE_URL.replace(/\/$/, "");
	const posts = await listPublished(db, { limit: 1000 });

	const staticUrls = [
		`${siteUrl}/`,
		...CATEGORIES.map((c) => `${siteUrl}/c/${c.slug}`),
	].map((u) => `  <url><loc>${escapeXml(u)}</loc></url>`);

	const postUrls = posts.map((p) => {
		const loc = `${siteUrl}/post/${p.slug}`;
		const lastmod = (p.updatedAt ?? p.publishedAt ?? new Date()).toISOString();
		return `  <url><loc>${escapeXml(loc)}</loc><lastmod>${lastmod}</lastmod></url>`;
	});

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...postUrls].join("\n")}
</urlset>`;

	return new Response(body, {
		headers: {
			"content-type": "application/xml; charset=utf-8",
			"cache-control": "public, max-age=3600",
		},
	});
}
