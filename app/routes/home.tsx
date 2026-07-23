import { PostCard } from "~/components/PostCard";
import { createDb } from "~/lib/db/client";
import { listPublished } from "~/lib/posts/repository";
import { seoMeta } from "~/lib/seo";
import type { Route } from "./+types/home";

export function meta({ data }: Route.MetaArgs) {
	return seoMeta({
		title: "RedditVN — Reddit hay, đọc bằng tiếng Việt",
		description:
			"Tổng hợp và dịch những bài Reddit chất lượng sang tiếng Việt: hỏi đáp, chuyện đời, kiến thức, suy ngẫm.",
		siteName: "RedditVN",
		url: data?.siteUrl,
	});
}

export async function loader({ context }: Route.LoaderArgs) {
	const db = createDb(context.cloudflare.env.DB);
	const posts = await listPublished(db, { limit: 20 });
	return { posts, siteUrl: context.cloudflare.env.SITE_URL };
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { posts } = loaderData;
	return (
		<div>
			<div className="mb-8">
				<h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
					Reddit hay,{" "}
					<span className="text-accent-600">đọc bằng tiếng Việt</span>
				</h1>
				<p className="mt-2 max-w-xl text-stone-500 dark:text-stone-400">
					Những bài đăng được cộng đồng Reddit đánh giá cao nhất, dịch tự nhiên
					sang tiếng Việt để bạn đọc và bàn luận.
				</p>
			</div>

			{posts.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-stone-300 py-16 text-center text-stone-500 dark:border-stone-700 dark:text-stone-400">
					<p className="font-medium">Chưa có bài viết nào được đăng.</p>
					<p className="mt-1 text-sm">
						Bài dịch sẽ xuất hiện ở đây sau khi pipeline chạy và được duyệt.
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{posts.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
				</div>
			)}
		</div>
	);
}
