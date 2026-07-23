import { ArrowFatUp } from "@phosphor-icons/react/dist/csr/ArrowFatUp";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { ChatCircleDots } from "@phosphor-icons/react/dist/csr/ChatCircleDots";
import { CategoryBadge } from "~/components/CategoryBadge";
import { createDb } from "~/lib/db/client";
import { formatCompact, formatRelativeTime, toParagraphs } from "~/lib/format";
import { getPublishedBySlug, incrementViewCount } from "~/lib/posts/repository";
import { listByPost } from "~/lib/reddit-comments/repository";
import { seoMeta } from "~/lib/seo";
import type { Route } from "./+types/post";

export function meta({ data }: Route.MetaArgs) {
	if (!data) return seoMeta({ title: "Không tìm thấy — RedditVN", description: "" });
	const excerpt = data.post.bodyVi.replace(/\s+/g, " ").trim().slice(0, 200);
	return seoMeta({
		title: `${data.post.titleVi} — RedditVN`,
		description: excerpt || data.post.titleVi,
		type: "article",
		siteName: "RedditVN",
		url: `${data.siteUrl}/post/${data.post.slug}`,
	});
}

export async function loader({ params, context }: Route.LoaderArgs) {
	const db = createDb(context.cloudflare.env.DB);
	const post = await getPublishedBySlug(db, params.slug);
	if (!post) throw new Response("Not Found", { status: 404 });

	const comments = await listByPost(db, post.id);
	// Count the view without blocking the response.
	context.cloudflare.ctx.waitUntil(incrementViewCount(db, post.id));

	return { post, comments, siteUrl: context.cloudflare.env.SITE_URL };
}

function AuthorInitial({ author }: { author: string | null }) {
	const initial = (author ?? "?").trim().charAt(0).toUpperCase() || "?";
	return (
		<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-100 text-xs font-bold text-accent-700 dark:bg-accent-500/15 dark:text-accent-400">
			{initial}
		</span>
	);
}

export default function PostPage({ loaderData }: Route.ComponentProps) {
	const { post, comments } = loaderData;
	return (
		<article>
			<div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
				<CategoryBadge slug={post.category} />
				<span>r/{post.subreddit}</span>
				{post.publishedAt && (
					<>
						<span aria-hidden>·</span>
						<span>{formatRelativeTime(post.publishedAt)}</span>
					</>
				)}
			</div>

			<h1 className="text-3xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
				{post.titleVi}
			</h1>

			<div className="mt-6 space-y-5 text-lg leading-relaxed text-stone-800 dark:text-stone-200">
				{toParagraphs(post.bodyVi).map((para, i) => (
					<p key={i} className="whitespace-pre-line">
						{para}
					</p>
				))}
			</div>

			<div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-stone-200 bg-stone-100/60 p-4 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
				<span className="font-semibold text-stone-800 dark:text-stone-200">
					Nguồn:
				</span>
				<span>r/{post.subreddit}</span>
				{post.redditAuthor && <span>· u/{post.redditAuthor}</span>}
				<span className="flex items-center gap-1">
					· <ArrowFatUp weight="fill" className="h-3.5 w-3.5" />
					{formatCompact(post.redditScore)}
				</span>
				<a
					href={post.sourceUrl}
					target="_blank"
					rel="noopener noreferrer nofollow"
					className="ml-auto flex items-center gap-1 font-medium text-accent-600 hover:underline"
				>
					Xem bản gốc
					<ArrowSquareOut weight="bold" className="h-3.5 w-3.5" />
				</a>
			</div>

			{comments.length > 0 && (
				<section className="mt-10">
					<h2 className="mb-4 text-lg font-bold text-stone-900 dark:text-stone-50">
						Bình luận nổi bật từ Reddit
					</h2>
					<ul className="space-y-3">
						{comments.map((c) => (
							<li
								key={c.id}
								className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
							>
								<div className="mb-2 flex items-center gap-2">
									<AuthorInitial author={c.redditAuthor} />
									<span className="text-sm font-medium text-stone-700 dark:text-stone-300">
										u/{c.redditAuthor ?? "ẩn danh"}
									</span>
									<span className="ml-auto flex items-center gap-1 text-xs font-medium text-stone-400 dark:text-stone-500">
										<ArrowFatUp weight="fill" className="h-3 w-3" />
										{formatCompact(c.redditScore)}
									</span>
								</div>
								<p className="whitespace-pre-line text-[15px] leading-relaxed text-stone-700 dark:text-stone-300">
									{c.bodyVi}
								</p>
							</li>
						))}
					</ul>
				</section>
			)}

			<section className="mt-10 border-t border-stone-200 pt-8 dark:border-stone-800">
				<h2 className="mb-3 text-lg font-bold text-stone-900 dark:text-stone-50">
					Bình luận của bạn
				</h2>
				<div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-stone-300 py-10 text-center dark:border-stone-700">
					<ChatCircleDots className="h-7 w-7 text-stone-400 dark:text-stone-500" />
					<p className="font-medium text-stone-600 dark:text-stone-300">
						Tính năng bình luận đang được hoàn thiện
					</p>
					<p className="max-w-xs text-sm text-stone-400 dark:text-stone-500">
						Sắp tới bạn sẽ đăng nhập bằng Google để tham gia bàn luận cùng cộng
						đồng.
					</p>
				</div>
			</section>
		</article>
	);
}
