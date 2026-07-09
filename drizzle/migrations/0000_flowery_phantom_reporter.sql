CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	`parent_id` text,
	`body` text NOT NULL,
	`status` text DEFAULT 'visible' NOT NULL,
	`like_count` integer DEFAULT 0 NOT NULL,
	`report_count` integer DEFAULT 0 NOT NULL,
	`edited` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comments_post_idx` ON `comments` (`post_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `comments_user_idx` ON `comments` (`user_id`);--> statement-breakpoint
CREATE INDEX `comments_parent_idx` ON `comments` (`parent_id`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`reddit_id` text NOT NULL,
	`subreddit` text NOT NULL,
	`category` text NOT NULL,
	`source_url` text NOT NULL,
	`reddit_author` text,
	`reddit_score` integer DEFAULT 0 NOT NULL,
	`reddit_num_comments` integer DEFAULT 0 NOT NULL,
	`reddit_created_at` integer,
	`post_type` text DEFAULT 'text' NOT NULL,
	`nsfw` integer DEFAULT false NOT NULL,
	`title_en` text NOT NULL,
	`title_vi` text NOT NULL,
	`body_en` text DEFAULT '' NOT NULL,
	`body_vi` text DEFAULT '' NOT NULL,
	`thumbnail_url` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`slug` text,
	`view_count` integer DEFAULT 0 NOT NULL,
	`translation_model` text,
	`translated_at` integer,
	`editor_id` text,
	`reject_reason` text,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_reddit_id_idx` ON `posts` (`reddit_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_idx` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_status_published_idx` ON `posts` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `posts_category_published_idx` ON `posts` (`category`,`published_at`);--> statement-breakpoint
CREATE INDEX `posts_subreddit_idx` ON `posts` (`subreddit`);--> statement-breakpoint
CREATE TABLE `reddit_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`reddit_comment_id` text NOT NULL,
	`parent_reddit_id` text,
	`reddit_author` text,
	`reddit_score` integer DEFAULT 0 NOT NULL,
	`body_en` text NOT NULL,
	`body_vi` text NOT NULL,
	`depth` integer DEFAULT 0 NOT NULL,
	`rank` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reddit_comments_post_idx` ON `reddit_comments` (`post_id`,`rank`);--> statement-breakpoint
CREATE TABLE `subreddits` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`display_name` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`enabled` integer DEFAULT true NOT NULL,
	`min_upvotes` integer DEFAULT 500 NOT NULL,
	`allow_nsfw` integer DEFAULT false NOT NULL,
	`fetch_limit` integer DEFAULT 10 NOT NULL,
	`sort` text DEFAULT 'top' NOT NULL,
	`time_filter` text DEFAULT 'week' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subreddits_name_idx` ON `subreddits` (`name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`google_id` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`avatar_url` text,
	`role` text DEFAULT 'reader' NOT NULL,
	`banned` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`last_login_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_google_id_idx` ON `users` (`google_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);