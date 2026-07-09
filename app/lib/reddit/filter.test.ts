import { describe, expect, test } from "vitest";
import {
	isQualityComment,
	isQualityPost,
	selectQualityPosts,
	selectTopComments,
} from "./filter";
import type { RedditComment, RedditPost } from "./types";

function makePost(overrides: Partial<RedditPost> = {}): RedditPost {
	return {
		id: "abc123",
		name: "t3_abc123",
		title: "A good question",
		selftext: "body",
		author: "alice",
		score: 1000,
		num_comments: 50,
		created_utc: 1_700_000_000,
		permalink: "/r/AskReddit/comments/abc123/",
		url: "https://reddit.com/...",
		over_18: false,
		is_self: true,
		stickied: false,
		locked: false,
		subreddit: "AskReddit",
		post_hint: null,
		thumbnail: null,
		distinguished: null,
		...overrides,
	};
}

function makeComment(overrides: Partial<RedditComment> = {}): RedditComment {
	return {
		id: "c1",
		name: "t1_c1",
		author: "bob",
		body: "This is a great answer.",
		score: 100,
		created_utc: 1_700_000_100,
		parent_id: "t3_abc123",
		stickied: false,
		distinguished: null,
		...overrides,
	};
}

const criteria = { minUpvotes: 500, allowNsfw: false };

describe("isQualityPost", () => {
	test("accepts a normal high-score self post", () => {
		expect(isQualityPost(makePost(), criteria)).toBe(true);
	});

	test("rejects posts below the upvote threshold", () => {
		expect(isQualityPost(makePost({ score: 100 }), criteria)).toBe(false);
	});

	test("rejects stickied, locked, and distinguished posts", () => {
		expect(isQualityPost(makePost({ stickied: true }), criteria)).toBe(false);
		expect(isQualityPost(makePost({ locked: true }), criteria)).toBe(false);
		expect(isQualityPost(makePost({ distinguished: "moderator" }), criteria)).toBe(
			false,
		);
	});

	test("rejects NSFW unless allowed", () => {
		expect(isQualityPost(makePost({ over_18: true }), criteria)).toBe(false);
		expect(
			isQualityPost(makePost({ over_18: true }), { ...criteria, allowNsfw: true }),
		).toBe(true);
	});

	test("rejects posts with a blank title", () => {
		expect(isQualityPost(makePost({ title: "   " }), criteria)).toBe(false);
	});
});

describe("selectQualityPosts", () => {
	test("filters out low-quality and sorts by score descending", () => {
		const posts = [
			makePost({ id: "a", score: 800 }),
			makePost({ id: "b", score: 100 }), // filtered (below threshold)
			makePost({ id: "c", score: 2000 }),
		];
		const result = selectQualityPosts(posts, criteria);
		expect(result.map((p) => p.id)).toEqual(["c", "a"]);
	});
});

describe("isQualityComment", () => {
	test("accepts a substantive upvoted comment", () => {
		expect(isQualityComment(makeComment())).toBe(true);
	});

	test("rejects deleted/removed bodies", () => {
		expect(isQualityComment(makeComment({ body: "[deleted]" }))).toBe(false);
		expect(isQualityComment(makeComment({ body: "[removed]" }))).toBe(false);
	});

	test("rejects AutoModerator, stickied, and low-score comments", () => {
		expect(isQualityComment(makeComment({ author: "AutoModerator" }))).toBe(false);
		expect(isQualityComment(makeComment({ stickied: true }))).toBe(false);
		expect(isQualityComment(makeComment({ score: 1 }))).toBe(false);
	});
});

describe("selectTopComments", () => {
	test("returns the N highest-scoring quality comments", () => {
		const comments = [
			makeComment({ id: "low", score: 10 }),
			makeComment({ id: "high", score: 500 }),
			makeComment({ id: "deleted", body: "[deleted]", score: 999 }),
			makeComment({ id: "mid", score: 100 }),
		];
		const result = selectTopComments(comments, 2);
		expect(result.map((c) => c.id)).toEqual(["high", "mid"]);
	});
});
