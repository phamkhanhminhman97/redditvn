import { z } from "zod";

// Reddit API responses are validated at the boundary (never trust external data).
// Schemas capture only the subset of fields the pipeline uses; unknown fields pass through.

export const tokenResponseSchema = z.object({
	access_token: z.string(),
	token_type: z.string(),
	expires_in: z.number(),
});

export const redditPostSchema = z.object({
	id: z.string(),
	name: z.string(),
	title: z.string(),
	selftext: z.string().default(""),
	author: z.string().nullish(),
	score: z.number().default(0),
	num_comments: z.number().default(0),
	created_utc: z.number(),
	permalink: z.string(),
	url: z.string().nullish(),
	over_18: z.boolean().default(false),
	is_self: z.boolean().default(false),
	stickied: z.boolean().default(false),
	locked: z.boolean().default(false),
	subreddit: z.string(),
	post_hint: z.string().nullish(),
	thumbnail: z.string().nullish(),
	distinguished: z.string().nullish(),
});
export type RedditPost = z.infer<typeof redditPostSchema>;

export const redditCommentSchema = z.object({
	id: z.string(),
	name: z.string(),
	author: z.string().nullish(),
	body: z.string().default(""),
	score: z.number().default(0),
	created_utc: z.number(),
	parent_id: z.string(),
	stickied: z.boolean().default(false),
	distinguished: z.string().nullish(),
});
export type RedditComment = z.infer<typeof redditCommentSchema>;

const listingChildSchema = z.object({
	kind: z.string(),
	data: z.unknown(),
});

export const listingSchema = z.object({
	data: z.object({
		children: z.array(listingChildSchema),
		after: z.string().nullish(),
	}),
});
