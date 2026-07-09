import type { Db } from "../db/client";
import { createDb } from "../db/client";
import type { Subreddit } from "../db/schema";
import * as postsRepo from "../posts/repository";
import { insertRedditComments } from "../reddit-comments/repository";
import {
	createRedditClient,
	type FetchPostsOptions,
	type RedditClient,
} from "../reddit/client";
import { selectQualityPosts, selectTopComments } from "../reddit/filter";
import type { RedditPost } from "../reddit/types";
import type { ClaudeConfig } from "../translation/client";
import { translateComments, translatePost } from "../translation/translator";
import { listEnabledSubreddits } from "../subreddits/repository";

/** How many source comments to translate and store per post. */
const MAX_SOURCE_COMMENTS = 10;
/** How many raw comments to fetch before filtering. */
const COMMENT_FETCH_LIMIT = 40;

export interface PipelineResult {
	subreddits: number;
	fetched: number;
	created: number;
	skipped: number;
	errors: number;
}

/** Narrow a stored subreddit's free-text sort/time into the client's unions. */
function fetchOptionsFor(sub: Subreddit): FetchPostsOptions {
	return {
		sort: sub.sort === "hot" ? "hot" : "top",
		timeFilter: (["day", "week", "month", "year", "all"] as const).includes(
			sub.timeFilter as never,
		)
			? (sub.timeFilter as FetchPostsOptions["timeFilter"])
			: "week",
		limit: sub.fetchLimit,
	};
}

async function ingestPost(
	db: Db,
	reddit: RedditClient,
	claude: ClaudeConfig,
	sub: Subreddit,
	post: RedditPost,
): Promise<void> {
	const { titleVi, bodyVi } = await translatePost(claude, {
		subreddit: post.subreddit,
		titleEn: post.title,
		bodyEn: post.selftext,
	});

	const draft = await postsRepo.insertDraft(db, {
		redditId: post.id,
		subreddit: post.subreddit,
		category: sub.category,
		sourceUrl: `https://www.reddit.com${post.permalink}`,
		redditAuthor: post.author ?? null,
		redditScore: post.score,
		redditNumComments: post.num_comments,
		redditCreatedAt: new Date(post.created_utc * 1000),
		postType: post.is_self ? "text" : "link",
		nsfw: post.over_18,
		titleEn: post.title,
		titleVi,
		bodyEn: post.selftext,
		bodyVi,
		translationModel: claude.model,
		translatedAt: new Date(),
	});

	const topComments = selectTopComments(
		await reddit.fetchComments(post.subreddit, post.id, {
			limit: COMMENT_FETCH_LIMIT,
		}),
		MAX_SOURCE_COMMENTS,
	);
	if (topComments.length === 0) return;

	const translations = await translateComments(
		claude,
		topComments.map((c) => ({
			id: c.id,
			author: c.author ?? undefined,
			bodyEn: c.body,
		})),
	);

	const rows = topComments
		.map((c, rank) => ({
			postId: draft.id,
			redditCommentId: c.id,
			parentRedditId: c.parent_id,
			redditAuthor: c.author ?? null,
			redditScore: c.score,
			bodyEn: c.body,
			bodyVi: translations.get(c.id) ?? "",
			depth: 0,
			rank,
		}))
		.filter((r) => r.bodyVi.length > 0);

	await insertRedditComments(db, rows);
}

/**
 * Fetch → filter → translate → store-as-draft for every enabled subreddit.
 * Idempotent: posts already ingested (by reddit_id) are skipped. Per-item
 * failures are counted and logged, never aborting the whole run.
 */
export async function runPipeline(env: Env): Promise<PipelineResult> {
	const db = createDb(env.DB);
	const reddit = createRedditClient(
		{
			clientId: env.REDDIT_CLIENT_ID,
			clientSecret: env.REDDIT_CLIENT_SECRET,
			userAgent: env.REDDIT_USER_AGENT,
		},
		env.CACHE,
	);
	const claude: ClaudeConfig = {
		apiKey: env.ANTHROPIC_API_KEY,
		model: env.TRANSLATION_MODEL,
	};

	const subs = await listEnabledSubreddits(db);
	const result: PipelineResult = {
		subreddits: subs.length,
		fetched: 0,
		created: 0,
		skipped: 0,
		errors: 0,
	};

	for (const sub of subs) {
		let posts: RedditPost[];
		try {
			posts = await reddit.fetchTopPosts(sub.name, fetchOptionsFor(sub));
		} catch (error) {
			result.errors++;
			console.error(`[pipeline] fetch failed for r/${sub.name}:`, error);
			continue;
		}

		const quality = selectQualityPosts(posts, {
			minUpvotes: sub.minUpvotes,
			allowNsfw: sub.allowNsfw,
		});
		result.fetched += quality.length;

		for (const post of quality) {
			try {
				if (await postsRepo.existsByRedditId(db, post.id)) {
					result.skipped++;
					continue;
				}
				await ingestPost(db, reddit, claude, sub, post);
				result.created++;
			} catch (error) {
				result.errors++;
				console.error(`[pipeline] ingest failed for ${post.id}:`, error);
			}
		}
	}

	return result;
}
