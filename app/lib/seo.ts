interface SeoInput {
	title: string;
	description: string;
	url?: string;
	image?: string;
	type?: "website" | "article";
	siteName?: string;
}

type MetaDescriptor =
	| { title: string }
	| { name: string; content: string }
	| { property: string; content: string }
	| { tagName: "link"; rel: string; href: string };

/** Build React Router meta descriptors incl. Open Graph + canonical. */
export function seoMeta(input: SeoInput): MetaDescriptor[] {
	const meta: MetaDescriptor[] = [
		{ title: input.title },
		{ name: "description", content: input.description },
		{ property: "og:title", content: input.title },
		{ property: "og:description", content: input.description },
		{ property: "og:type", content: input.type ?? "website" },
		{ name: "twitter:card", content: "summary_large_image" },
	];
	if (input.siteName) meta.push({ property: "og:site_name", content: input.siteName });
	if (input.url) {
		meta.push({ property: "og:url", content: input.url });
		meta.push({ tagName: "link", rel: "canonical", href: input.url });
	}
	if (input.image) meta.push({ property: "og:image", content: input.image });
	return meta;
}
