import { asc, eq } from "drizzle-orm";
import type { Db } from "../db/client";
import { type Subreddit, subreddits } from "../db/schema";

export function listEnabledSubreddits(db: Db): Promise<Subreddit[]> {
	return db.select().from(subreddits).where(eq(subreddits.enabled, true));
}

export function listAllSubreddits(db: Db): Promise<Subreddit[]> {
	return db.select().from(subreddits).orderBy(asc(subreddits.name));
}
