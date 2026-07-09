import { asc, eq } from "drizzle-orm";
import type { Db } from "../db/client";
import {
	type NewRedditComment,
	type RedditComment,
	redditComments,
} from "../db/schema";

export async function insertRedditComments(
	db: Db,
	rows: readonly NewRedditComment[],
): Promise<void> {
	if (rows.length === 0) return;
	await db.insert(redditComments).values([...rows]);
}

/** Translated source comments for a post, in display order. */
export function listByPost(db: Db, postId: string): Promise<RedditComment[]> {
	return db
		.select()
		.from(redditComments)
		.where(eq(redditComments.postId, postId))
		.orderBy(asc(redditComments.rank));
}
