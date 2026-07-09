import type { RedditComment, RedditPost } from "./types";

const MIN_COMMENT_SCORE = 5;
const MIN_COMMENT_LENGTH = 3;
const DELETED_MARKERS = new Set(["[deleted]", "[removed]", "[deleted by user]"]);

export interface QualityCriteria {
	minUpvotes: number;
	allowNsfw: boolean;
}

/**
 * Whether a post is worth translating: not stickied/locked/mod-distinguished,
 * meets the score threshold, respects the NSFW setting, and has a title.
 * Pure & deterministic.
 */
export function isQualityPost(
	post: RedditPost,
	criteria: QualityCriteria,
): boolean {
	if (post.stickied || post.locked) return false;
	if (post.distinguished) return false; // moderator / admin posts
	if (post.over_18 && !criteria.allowNsfw) return false;
	if (post.score < criteria.minUpvotes) return false;
	if (!post.title.trim()) return false;
	return true;
}

/** Filter and sort a listing down to translatable, high-quality posts. */
export function selectQualityPosts(
	posts: readonly RedditPost[],
	criteria: QualityCriteria,
): RedditPost[] {
	return posts
		.filter((p) => isQualityPost(p, criteria))
		.sort((a, b) => b.score - a.score);
}

/** Whether a source comment is worth showing/translating. */
export function isQualityComment(comment: RedditComment): boolean {
	const body = comment.body.trim();
	if (body.length < MIN_COMMENT_LENGTH) return false;
	if (DELETED_MARKERS.has(body)) return false;
	if (comment.stickied) return false;
	if (comment.distinguished) return false;
	if (comment.author === "AutoModerator") return false;
	if (comment.score < MIN_COMMENT_SCORE) return false;
	return true;
}

/** Top N quality comments by score, highest first. */
export function selectTopComments(
	comments: readonly RedditComment[],
	limit: number,
): RedditComment[] {
	return comments
		.filter(isQualityComment)
		.sort((a, b) => b.score - a.score)
		.slice(0, limit);
}
