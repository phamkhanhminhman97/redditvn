import { ArrowFatUp } from "@phosphor-icons/react/dist/csr/ArrowFatUp";
import { ChatCircle } from "@phosphor-icons/react/dist/csr/ChatCircle";
import { Link } from "react-router";
import type { Post } from "~/lib/db/schema";
import { formatCompact, formatRelativeTime } from "~/lib/format";
import { CategoryBadge } from "./CategoryBadge";

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
		<article className="group rounded-2xl border border-stone-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-400/50 hover:shadow-lg hover:shadow-stone-200/60 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-accent-400/40 dark:hover:shadow-black/30">
			<div className="mb-2 flex items-center gap-2">
				<CategoryBadge slug={post.category} />
				<span className="text-xs text-stone-400 dark:text-stone-500">
					r/{post.subreddit}
				</span>
			</div>
			<h2 className="text-lg font-bold leading-snug text-stone-900 dark:text-stone-50">
				<Link
					to={`/post/${post.slug}`}
					className="transition-colors group-hover:text-accent-600"
				>
					{post.titleVi}
				</Link>
			</h2>
			{excerpt && (
				<p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
					{excerpt}…
				</p>
			)}
			<div className="mt-3 flex items-center gap-4 text-xs font-medium text-stone-400 dark:text-stone-500">
				<span className="flex items-center gap-1">
					<ArrowFatUp weight="fill" className="h-3.5 w-3.5" />
					{formatCompact(post.redditScore)}
				</span>
				<span className="flex items-center gap-1">
					<ChatCircle weight="fill" className="h-3.5 w-3.5" />
					{formatCompact(post.redditNumComments)}
				</span>
				{post.publishedAt && <span>{formatRelativeTime(post.publishedAt)}</span>}
			</div>
		</article>
	);
}
