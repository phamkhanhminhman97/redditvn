import { z } from "zod";
import {
	listingSchema,
	type RedditComment,
	redditCommentSchema,
	type RedditPost,
	redditPostSchema,
	tokenResponseSchema,
} from "./types";

const REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const REDDIT_OAUTH_BASE = "https://oauth.reddit.com";
const TOKEN_CACHE_KEY = "reddit:token";
const TOKEN_SAFETY_WINDOW_S = 60;
const MIN_TOKEN_TTL_S = 60;

export class RedditError extends Error {
	constructor(
		readonly status: number,
		message: string,
	) {
		super(message);
		this.name = "RedditError";
	}
}

export interface RedditCredentials {
	clientId: string;
	clientSecret: string;
	userAgent: string;
}

export interface FetchPostsOptions {
	sort?: "top" | "hot";
	timeFilter?: "day" | "week" | "month" | "year" | "all";
	limit?: number;
}

export interface RedditClient {
	fetchTopPosts(
		subreddit: string,
		opts?: FetchPostsOptions,
	): Promise<RedditPost[]>;
	fetchComments(
		subreddit: string,
		postId: string,
		opts?: { limit?: number },
	): Promise<RedditComment[]>;
}

/**
 * Reddit read-only client using application-only OAuth (client_credentials).
 * The bearer token is cached in KV until just before it expires.
 * Requires a confidential Reddit app (type "web app" or "script").
 */
export function createRedditClient(
	creds: RedditCredentials,
	kv: KVNamespace,
): RedditClient {
	async function requestToken(): Promise<string> {
		const res = await fetch(REDDIT_TOKEN_URL, {
			method: "POST",
			headers: {
				Authorization: `Basic ${btoa(`${creds.clientId}:${creds.clientSecret}`)}`,
				"Content-Type": "application/x-www-form-urlencoded",
				"User-Agent": creds.userAgent,
			},
			body: "grant_type=client_credentials",
		});
		if (!res.ok) {
			throw new RedditError(res.status, `Token request failed: ${await res.text()}`);
		}
		const data = tokenResponseSchema.parse(await res.json());
		const ttl = Math.max(MIN_TOKEN_TTL_S, data.expires_in - TOKEN_SAFETY_WINDOW_S);
		await kv.put(TOKEN_CACHE_KEY, data.access_token, { expirationTtl: ttl });
		return data.access_token;
	}

	async function getToken(forceRefresh = false): Promise<string> {
		if (!forceRefresh) {
			const cached = await kv.get(TOKEN_CACHE_KEY);
			if (cached) return cached;
		}
		return requestToken();
	}

	/** GET an oauth.reddit.com path, refreshing the token once on 401. */
	async function authedGet(path: string): Promise<unknown> {
		for (const forceRefresh of [false, true]) {
			const token = await getToken(forceRefresh);
			const res = await fetch(`${REDDIT_OAUTH_BASE}${path}`, {
				headers: {
					Authorization: `Bearer ${token}`,
					"User-Agent": creds.userAgent,
				},
			});
			if (res.status === 401 && !forceRefresh) continue; // stale token → refresh & retry
			if (!res.ok) {
				throw new RedditError(res.status, `GET ${path} failed: ${await res.text()}`);
			}
			return res.json();
		}
		throw new RedditError(401, `GET ${path} failed: unauthorized after refresh`);
	}

	async function fetchTopPosts(
		subreddit: string,
		opts: FetchPostsOptions = {},
	): Promise<RedditPost[]> {
		const sort = opts.sort ?? "top";
		const params = new URLSearchParams({
			limit: String(opts.limit ?? 10),
			t: opts.timeFilter ?? "week",
			raw_json: "1",
		});
		const json = await authedGet(
			`/r/${encodeURIComponent(subreddit)}/${sort}?${params}`,
		);
		const listing = listingSchema.parse(json);
		return listing.data.children
			.filter((c) => c.kind === "t3")
			.map((c) => redditPostSchema.safeParse(c.data))
			.flatMap((r) => (r.success ? [r.data] : []));
	}

	async function fetchComments(
		subreddit: string,
		postId: string,
		opts: { limit?: number } = {},
	): Promise<RedditComment[]> {
		const params = new URLSearchParams({
			limit: String(opts.limit ?? 20),
			sort: "top",
			depth: "1",
			raw_json: "1",
		});
		const json = await authedGet(
			`/r/${encodeURIComponent(subreddit)}/comments/${encodeURIComponent(postId)}?${params}`,
		);
		// Response is [postListing, commentListing].
		const [, commentListing] = z.tuple([listingSchema, listingSchema]).parse(json);
		return commentListing.data.children
			.filter((c) => c.kind === "t1")
			.map((c) => redditCommentSchema.safeParse(c.data))
			.flatMap((r) => (r.success ? [r.data] : []));
	}

	return { fetchTopPosts, fetchComments };
}
