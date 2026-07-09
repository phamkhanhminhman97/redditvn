import { Link } from "react-router";
import { categoryLabel } from "~/lib/categories";
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

export default function PostPage({ loaderData }: Route.ComponentProps) {
	const { post, comments } = loaderData;
	return (
		<article>
			<div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
				<Link to={`/c/${post.category}`} className="font-medium text-orange-600">
					{categoryLabel(post.category)}
				</Link>
				<span aria-hidden>·</span>
				<span>r/{post.subreddit}</span>
				{post.publishedAt && (
					<>
						<span aria-hidden>·</span>
						<span>{formatRelativeTime(post.publishedAt)}</span>
					</>
				)}
			</div>

			<h1 className="text-2xl font-bold leading-tight sm:text-3xl">{post.titleVi}</h1>

			<div className="mt-4 space-y-4 text-[17px] leading-relaxed text-gray-800">
				{toParagraphs(post.bodyVi).map((para, i) => (
					<p key={i} className="whitespace-pre-line">
						{para}
					</p>
				))}
			</div>

			<div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
				<span className="font-medium">Nguồn: </span>
				<span>r/{post.subreddit}</span>
				{post.redditAuthor && <span> · u/{post.redditAuthor}</span>}
				<span> · ▲ {formatCompact(post.redditScore)}</span>
				<a
					href={post.sourceUrl}
					target="_blank"
					rel="noopener noreferrer nofollow"
					className="ml-1 text-orange-600 hover:underline"
				>
					Xem bản gốc trên Reddit ↗
				</a>
			</div>

			{comments.length > 0 && (
				<section className="mt-8">
					<h2 className="mb-3 text-lg font-semibold">
						Bình luận nổi bật từ Reddit
					</h2>
					<ul className="space-y-4">
						{comments.map((c) => (
							<li key={c.id} className="rounded-lg border border-gray-100 p-4">
								<div className="mb-1 text-xs text-gray-400">
									u/{c.redditAuthor ?? "ẩn danh"} · ▲ {formatCompact(c.redditScore)}
								</div>
								<p className="whitespace-pre-line text-[15px] leading-relaxed text-gray-800">
									{c.bodyVi}
								</p>
							</li>
						))}
					</ul>
				</section>
			)}

			<section className="mt-10 border-t border-gray-200 pt-6">
				<h2 className="mb-2 text-lg font-semibold">Bình luận của bạn</h2>
				<p className="text-sm text-gray-500">
					Tính năng đăng nhập &amp; bình luận đang được hoàn thiện.
				</p>
			</section>
		</article>
	);
}
