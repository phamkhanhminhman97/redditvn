import type { Route } from "./+types/robots";

export function loader({ context }: Route.LoaderArgs) {
	const siteUrl = context.cloudflare.env.SITE_URL.replace(/\/$/, "");
	const body = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${siteUrl}/sitemap.xml
`;
	return new Response(body, {
		headers: { "content-type": "text/plain; charset=utf-8" },
	});
}
