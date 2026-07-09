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
			<h1 className="sr-only">RedditVN — Reddit hay bằng tiếng Việt</h1>
			{posts.length === 0 ? (
				<div className="rounded-lg border border-dashed border-gray-200 py-16 text-center text-gray-500">
					<p className="font-medium">Chưa có bài viết nào được đăng.</p>
					<p className="mt-1 text-sm">
						Bài dịch sẽ xuất hiện ở đây sau khi pipeline chạy và được duyệt.
					</p>
				</div>
			) : (
				<div>
					{posts.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
				</div>
			)}
		</div>
	);
}
