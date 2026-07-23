import { RssSimple } from "@phosphor-icons/react/dist/csr/RssSimple";
import { Link, useLocation } from "react-router";
import { CATEGORIES } from "~/lib/categories";
import { Logo, LogoMark } from "./Logo";

export function SiteLayout({ children }: { children: React.ReactNode }) {
	const location = useLocation();

	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/85 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/85">
				<div className="mx-auto max-w-3xl px-4">
					<div className="flex h-16 items-center justify-between">
						<Link to="/" className="transition-opacity hover:opacity-80">
							<Logo />
						</Link>
						<a
							href="/rss.xml"
							aria-label="RSS"
							className="flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-accent-600 dark:text-stone-400"
						>
							<RssSimple weight="bold" className="h-4 w-4" />
							RSS
						</a>
					</div>
					<nav
						aria-label="Chuyên mục"
						className="flex gap-1.5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					>
						{CATEGORIES.map((c) => {
							const isActive = location.pathname === `/c/${c.slug}`;
							return (
								<Link
									key={c.slug}
									to={`/c/${c.slug}`}
									className={
										isActive
											? "shrink-0 rounded-full bg-accent-600 px-3 py-1.5 text-sm font-semibold text-white"
											: "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
									}
								>
									{c.label}
								</Link>
							);
						})}
					</nav>
				</div>
			</header>

			<main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
				{children}
			</main>

			<footer className="border-t border-stone-200 dark:border-stone-800">
				<div className="mx-auto max-w-3xl px-4 py-10">
					<div className="grid gap-8 sm:grid-cols-2">
						<div>
							<LogoMark className="h-8 w-8" />
							<p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-500 dark:text-stone-400">
								RedditVN tổng hợp và dịch những bài Reddit chất lượng sang tiếng
								Việt để cộng đồng cùng đọc và bàn luận.
							</p>
						</div>
						<div>
							<h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
								Chuyên mục
							</h2>
							<ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-stone-500 dark:text-stone-400">
								{CATEGORIES.map((c) => (
									<li key={c.slug}>
										<Link to={`/c/${c.slug}`} className="hover:text-accent-600">
											{c.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
					<p className="mt-8 border-t border-stone-200 pt-6 text-xs text-stone-400 dark:border-stone-800 dark:text-stone-500">
						Nội dung được dịch từ Reddit và thuộc bản quyền của tác giả gốc. Mỗi
						bài đều kèm liên kết tới nguồn.
					</p>
				</div>
			</footer>
		</div>
	);
}
