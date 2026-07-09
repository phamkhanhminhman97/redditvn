import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import { SiteLayout } from "~/components/SiteLayout";
import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
	{ rel: "alternate", type: "application/rss+xml", title: "RedditVN", href: "/rss.xml" },
];

export const meta: Route.MetaFunction = () => [
	{ title: "RedditVN — Reddit hay, đọc bằng tiếng Việt" },
	{
		name: "description",
		content:
			"Tổng hợp và dịch những bài Reddit chất lượng sang tiếng Việt: hỏi đáp, chuyện đời, kiến thức, suy ngẫm.",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="vi">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return (
		<SiteLayout>
			<Outlet />
		</SiteLayout>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let heading = "Đã có lỗi xảy ra";
	let detail = "Vui lòng thử lại sau.";

	if (isRouteErrorResponse(error)) {
		heading = error.status === 404 ? "Không tìm thấy trang" : `Lỗi ${error.status}`;
		detail =
			error.status === 404
				? "Bài viết bạn tìm không tồn tại hoặc đã bị gỡ."
				: error.statusText || detail;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		detail = error.message;
	}

	return (
		<SiteLayout>
			<div className="py-16 text-center">
				<h1 className="text-2xl font-bold">{heading}</h1>
				<p className="mt-2 text-gray-600">{detail}</p>
			</div>
		</SiteLayout>
	);
}
