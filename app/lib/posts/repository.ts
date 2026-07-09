import { and, desc, eq, sql } from "drizzle-orm";
import type { Db } from "../db/client";
import { type NewPost, type Post, posts } from "../db/schema";

export const DEFAULT_PAGE_SIZE = 20;

interface ListOptions {
	category?: string;
	limit?: number;
	offset?: number;
}

function publishedWhere(category?: string) {
	return category
		? and(eq(posts.status, "published"), eq(posts.category, category))
		: eq(posts.status, "published");
}

/** Published posts, newest first, optionally filtered by category. */
export function listPublished(db: Db, opts: ListOptions = {}): Promise<Post[]> {
	return db
		.select()
		.from(posts)
		.where(publishedWhere(opts.category))
		.orderBy(desc(posts.publishedAt))
		.limit(opts.limit ?? DEFAULT_PAGE_SIZE)
		.offset(opts.offset ?? 0);
}

export async function countPublished(
	db: Db,
	category?: string,
): Promise<number> {
	const rows = await db
		.select({ n: sql<number>`count(*)` })
		.from(posts)
		.where(publishedWhere(category));
	return rows[0]?.n ?? 0;
}

export async function getPublishedBySlug(
	db: Db,
	slug: string,
): Promise<Post | null> {
	const rows = await db
		.select()
		.from(posts)
		.where(and(eq(posts.slug, slug), eq(posts.status, "published")))
		.limit(1);
	return rows[0] ?? null;
}

export async function getById(db: Db, id: string): Promise<Post | null> {
	const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
	return rows[0] ?? null;
}

/** Drafts (or any status) for the admin queue, newest first. */
export function listByStatus(
	db: Db,
	status: Post["status"],
	opts: { limit?: number; offset?: number } = {},
): Promise<Post[]> {
	return db
		.select()
		.from(posts)
		.where(eq(posts.status, status))
		.orderBy(desc(posts.createdAt))
		.limit(opts.limit ?? DEFAULT_PAGE_SIZE)
		.offset(opts.offset ?? 0);
}

/** Idempotency guard for the fetch pipeline. */
export async function existsByRedditId(
	db: Db,
	redditId: string,
): Promise<boolean> {
	const rows = await db
		.select({ id: posts.id })
		.from(posts)
		.where(eq(posts.redditId, redditId))
		.limit(1);
	return rows.length > 0;
}

export async function insertDraft(db: Db, data: NewPost): Promise<Post> {
	const rows = await db
		.insert(posts)
		.values({ ...data, status: "draft" })
		.returning();
	return rows[0];
}

/** Immutable partial update; always bumps updatedAt. */
export async function updatePost(
	db: Db,
	id: string,
	patch: Partial<Omit<Post, "id" | "createdAt">>,
): Promise<Post> {
	const rows = await db
		.update(posts)
		.set({ ...patch, updatedAt: new Date() })
		.where(eq(posts.id, id))
		.returning();
	if (!rows[0]) throw new Error(`Post not found: ${id}`);
	return rows[0];
}

export function publishPost(
	db: Db,
	id: string,
	opts: { slug: string; editorId?: string },
): Promise<Post> {
	return updatePost(db, id, {
		status: "published",
		slug: opts.slug,
		editorId: opts.editorId ?? null,
		rejectReason: null,
		publishedAt: new Date(),
	});
}

export function rejectPost(
	db: Db,
	id: string,
	opts: { reason: string; editorId?: string },
): Promise<Post> {
	return updatePost(db, id, {
		status: "rejected",
		rejectReason: opts.reason,
		editorId: opts.editorId ?? null,
	});
}

export async function incrementViewCount(db: Db, id: string): Promise<void> {
	await db
		.update(posts)
		.set({ viewCount: sql`${posts.viewCount} + 1` })
		.where(eq(posts.id, id));
}
