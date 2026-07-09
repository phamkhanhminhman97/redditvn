import { PostCard } from "~/components/PostCard";
import { getCategory } from "~/lib/categories";
import { createDb } from "~/lib/db/client";
import { listPublished } from "~/lib/posts/repository";
import { seoMeta } from "~/lib/seo";
import type { Route } from "./+types/category";

export function meta({ data }: Route.MetaArgs) {
	if (!data) return seoMeta({ title: "Chuyên mục — RedditVN", description: "" });
	return seoMeta({
		title: `${data.label} — RedditVN`,
		description: data.description,
		siteName: "RedditVN",
		url: `${data.siteUrl}/c/${data.slug}`,
	});
}

export async function loader({ params, context }: Route.LoaderArgs) {
	const db = createDb(context.cloudflare.env.DB);
	const category = getCategory(params.slug);
	const posts = await listPublished(db, { category: params.slug, limit: 30 });
	return {
		posts,
		slug: params.slug,
		label: category?.label ?? params.slug,
		description: category?.description ?? "",
		siteUrl: context.cloudflare.env.SITE_URL,
	};
}

export default function CategoryPage({ loaderData }: Route.ComponentProps) {
	const { posts, label, description } = loaderData;
	return (
		<div>
			<header className="mb-4">
				<h1 className="text-2xl font-bold">{label}</h1>
				{description && <p className="mt-1 text-gray-500">{description}</p>}
			</header>
			{posts.length === 0 ? (
				<p className="py-12 text-center text-gray-500">
					Chưa có bài viết nào trong chuyên mục này.
				</p>
			) : (
				posts.map((post) => <PostCard key={post.id} post={post} />)
			)}
		</div>
	);
}
