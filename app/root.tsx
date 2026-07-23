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
	// Be Vietnam Pro is self-hosted via @fontsource (imported in app.css) —
	// no external font request needed.
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
				<h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
					{heading}
				</h1>
				<p className="mt-2 text-stone-500 dark:text-stone-400">{detail}</p>
			</div>
		</SiteLayout>
	);
}
