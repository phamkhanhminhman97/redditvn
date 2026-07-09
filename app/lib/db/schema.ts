import {
	index,
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

// --- Shared column helpers -------------------------------------------------

/** Unix-ms timestamp column. */
const ts = (name: string) => integer(name, { mode: "timestamp_ms" });

/** App-generated UUID primary key (crypto.randomUUID at insert time). */
const uuidPk = () =>
	text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
	ts("created_at")
		.notNull()
		.$defaultFn(() => new Date());

// --- Enums (string-literal unions, stored as text) -------------------------

export const POST_STATUSES = [
	"draft",
	"published",
	"rejected",
	"archived",
] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_TYPES = ["text", "link", "image", "gallery"] as const;
export type PostType = (typeof POST_TYPES)[number];

export const USER_ROLES = ["reader", "editor", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const COMMENT_STATUSES = [
	"visible",
	"pending",
	"hidden",
	"deleted",
] as const;
export type CommentStatus = (typeof COMMENT_STATUSES)[number];

// --- subreddits: source configuration for the fetch pipeline ---------------

export const subreddits = sqliteTable("subreddits", {
	id: uuidPk(),
	/** Subreddit name without the "r/" prefix, e.g. "AskReddit". */
	name: text("name").notNull(),
	/** Vietnamese display label, e.g. "Hỏi đáp". */
	displayName: text("display_name").notNull(),
	/** Category slug used for public navigation, e.g. "hoi-dap". */
	category: text("category").notNull(),
	description: text("description"),
	enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
	/** Minimum Reddit score for a post to enter the pipeline. */
	minUpvotes: integer("min_upvotes").notNull().default(500),
	allowNsfw: integer("allow_nsfw", { mode: "boolean" })
		.notNull()
		.default(false),
	/** How many top posts to pull per run. */
	fetchLimit: integer("fetch_limit").notNull().default(10),
	/** Reddit listing sort: "top" | "hot". */
	sort: text("sort").notNull().default("top"),
	/** Time window for "top" sort: "day" | "week" | "month". */
	timeFilter: text("time_filter").notNull().default("week"),
	createdAt: createdAt(),
}, (t) => [uniqueIndex("subreddits_name_idx").on(t.name)]);

// --- posts: the core content unit ------------------------------------------

export const posts = sqliteTable(
	"posts",
	{
		id: uuidPk(),
		/** Reddit base-36 id (e.g. "1abc23"), used for idempotent dedup. */
		redditId: text("reddit_id").notNull(),
		subreddit: text("subreddit").notNull(),
		category: text("category").notNull(),
		sourceUrl: text("source_url").notNull(),
		redditAuthor: text("reddit_author"),
		redditScore: integer("reddit_score").notNull().default(0),
		redditNumComments: integer("reddit_num_comments").notNull().default(0),
		redditCreatedAt: ts("reddit_created_at"),
		postType: text("post_type").$type<PostType>().notNull().default("text"),
		nsfw: integer("nsfw", { mode: "boolean" }).notNull().default(false),

		titleEn: text("title_en").notNull(),
		titleVi: text("title_vi").notNull(),
		bodyEn: text("body_en").notNull().default(""),
		bodyVi: text("body_vi").notNull().default(""),
		thumbnailUrl: text("thumbnail_url"),

		status: text("status").$type<PostStatus>().notNull().default("draft"),
		/** URL slug; null until published. Unique across published posts. */
		slug: text("slug"),
		viewCount: integer("view_count").notNull().default(0),

		translationModel: text("translation_model"),
		translatedAt: ts("translated_at"),
		/** Editor (user id) who approved/rejected. */
		editorId: text("editor_id"),
		rejectReason: text("reject_reason"),

		publishedAt: ts("published_at"),
		createdAt: createdAt(),
		updatedAt: ts("updated_at")
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(t) => [
		uniqueIndex("posts_reddit_id_idx").on(t.redditId),
		uniqueIndex("posts_slug_idx").on(t.slug),
		index("posts_status_published_idx").on(t.status, t.publishedAt),
		index("posts_category_published_idx").on(t.category, t.publishedAt),
		index("posts_subreddit_idx").on(t.subreddit),
	],
);

// --- reddit_comments: translated top comments from the source thread -------

export const redditComments = sqliteTable(
	"reddit_comments",
	{
		id: uuidPk(),
		postId: text("post_id")
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		redditCommentId: text("reddit_comment_id").notNull(),
		parentRedditId: text("parent_reddit_id"),
		redditAuthor: text("reddit_author"),
		redditScore: integer("reddit_score").notNull().default(0),
		bodyEn: text("body_en").notNull(),
		bodyVi: text("body_vi").notNull(),
		/** Nesting level (0 = top-level). */
		depth: integer("depth").notNull().default(0),
		/** Display order within the post. */
		rank: integer("rank").notNull().default(0),
		createdAt: createdAt(),
	},
	(t) => [index("reddit_comments_post_idx").on(t.postId, t.rank)],
);

// --- users: reader accounts (Google login) ---------------------------------

export const users = sqliteTable(
	"users",
	{
		id: uuidPk(),
		googleId: text("google_id").notNull(),
		email: text("email").notNull(),
		displayName: text("display_name").notNull(),
		avatarUrl: text("avatar_url"),
		role: text("role").$type<UserRole>().notNull().default("reader"),
		banned: integer("banned", { mode: "boolean" }).notNull().default(false),
		createdAt: createdAt(),
		lastLoginAt: ts("last_login_at"),
	},
	(t) => [
		uniqueIndex("users_google_id_idx").on(t.googleId),
		uniqueIndex("users_email_idx").on(t.email),
	],
);

// --- comments: our Vietnamese community comments on posts ------------------

export const comments = sqliteTable(
	"comments",
	{
		id: uuidPk(),
		postId: text("post_id")
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		/** Self-reference for threading; null = top-level. */
		parentId: text("parent_id"),
		body: text("body").notNull(),
		status: text("status")
			.$type<CommentStatus>()
			.notNull()
			.default("visible"),
		likeCount: integer("like_count").notNull().default(0),
		reportCount: integer("report_count").notNull().default(0),
		edited: integer("edited", { mode: "boolean" }).notNull().default(false),
		createdAt: createdAt(),
		updatedAt: ts("updated_at")
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(t) => [
		index("comments_post_idx").on(t.postId, t.createdAt),
		index("comments_user_idx").on(t.userId),
		index("comments_parent_idx").on(t.parentId),
	],
);

// --- Inferred row types -----------------------------------------------------

export type Subreddit = typeof subreddits.$inferSelect;
export type NewSubreddit = typeof subreddits.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type RedditComment = typeof redditComments.$inferSelect;
export type NewRedditComment = typeof redditComments.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
