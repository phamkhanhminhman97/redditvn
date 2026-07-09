import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("post/:slug", "routes/post.tsx"),
	route("c/:slug", "routes/category.tsx"),
	route("sitemap.xml", "routes/sitemap.tsx"),
	route("rss.xml", "routes/rss.tsx"),
	route("robots.txt", "routes/robots.tsx"),
] satisfies RouteConfig;
