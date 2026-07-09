export interface Category {
	slug: string;
	label: string;
	description: string;
}

/** Public navigation categories. Slugs match `posts.category` / `subreddits.category`. */
export const CATEGORIES: readonly Category[] = [
	{ slug: "hoi-dap", label: "Hỏi đáp", description: "Câu hỏi thú vị và câu trả lời hay từ Reddit" },
	{ slug: "tifu", label: "Chuyện dở khóc dở cười", description: "Những pha tự làm khó mình" },
	{ slug: "tinh-cam", label: "Tâm sự & Tình cảm", description: "Chuyện các mối quan hệ" },
	{ slug: "kien-thuc", label: "Kiến thức", description: "Sự thật thú vị ít người biết" },
	{ slug: "suy-ngam", label: "Suy ngẫm", description: "Những suy nghĩ khiến bạn gật gù" },
	{ slug: "meo-hay", label: "Mẹo hay", description: "Mẹo nhỏ cho cuộc sống dễ hơn" },
	{ slug: "kinh-di", label: "Kinh dị", description: "Truyện rùng rợn tự sáng tác" },
];

const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function getCategory(slug: string): Category | undefined {
	return CATEGORY_BY_SLUG.get(slug);
}

export function categoryLabel(slug: string): string {
	return CATEGORY_BY_SLUG.get(slug)?.label ?? slug;
}
