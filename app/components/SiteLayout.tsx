import { Link } from "react-router";
import { CATEGORIES } from "~/lib/categories";

export function SiteLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col bg-white text-gray-900">
			<header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
				<div className="mx-auto max-w-3xl px-4">
					<div className="flex h-14 items-center justify-between">
						<Link
							to="/"
							className="text-xl font-extrabold tracking-tight text-orange-600"
						>
							RedditVN
						</Link>
						<a
							href="/rss.xml"
							className="text-sm text-gray-500 hover:text-orange-600"
						>
							RSS
						</a>
					</div>
					<nav className="flex gap-4 overflow-x-auto pb-2 text-sm">
						{CATEGORIES.map((c) => (
							<Link
								key={c.slug}
								to={`/c/${c.slug}`}
								className="whitespace-nowrap text-gray-600 hover:text-orange-600"
							>
								{c.label}
							</Link>
						))}
					</nav>
				</div>
			</header>

			<main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>

			<footer className="mt-8 border-t border-gray-200">
				<div className="mx-auto max-w-3xl px-4 py-6 text-sm text-gray-500">
					<p>RedditVN — tổng hợp &amp; dịch những bài Reddit chất lượng sang tiếng Việt.</p>
					<p className="mt-1">
						Nội dung được dịch từ Reddit và thuộc bản quyền của tác giả gốc. Mỗi bài
						đều kèm liên kết tới nguồn.
					</p>
				</div>
			</footer>
		</div>
	);
}
