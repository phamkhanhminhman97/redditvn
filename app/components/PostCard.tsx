import { Link } from "react-router";
import { categoryLabel } from "~/lib/categories";
import type { Post } from "~/lib/db/schema";
import { formatCompact, formatRelativeTime } from "~/lib/format";

const EXCERPT_LENGTH = 160;

interface PostCardProps {
	post: Pick<
		Post,
		| "slug"
		| "titleVi"
		| "bodyVi"
		| "category"
		| "subreddit"
		| "redditScore"
		| "redditNumComments"
		| "publishedAt"
	>;
}

export function PostCard({ post }: PostCardProps) {
	const excerpt = post.bodyVi.replace(/\s+/g, " ").trim().slice(0, EXCERPT_LENGTH);
	return (
		<article className="border-b border-gray-100 py-4 last:border-0">
			<div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
				<Link to={`/c/${post.category}`} className="font-medium text-orange-600">
					{categoryLabel(post.category)}
				</Link>
				<span aria-hidden>·</span>
				<span>r/{post.subreddit}</span>
			</div>
			<h2 className="text-lg font-semibold leading-snug">
				<Link to={`/post/${post.slug}`} className="hover:text-orange-600">
					{post.titleVi}
				</Link>
			</h2>
			{excerpt && (
				<p className="mt-1 line-clamp-2 text-sm text-gray-600">{excerpt}…</p>
			)}
			<div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
				<span>▲ {formatCompact(post.redditScore)}</span>
				<span>💬 {formatCompact(post.redditNumComments)}</span>
				{post.publishedAt && <span>{formatRelativeTime(post.publishedAt)}</span>}
			</div>
		</article>
	);
}
