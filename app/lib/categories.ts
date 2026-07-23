export interface Category {
	slug: string;
	label: string;
	description: string;
	/** Tailwind classes for the category pill badge. Literal strings so the
	 *  Tailwind JIT scanner can find them — never build these by interpolation. */
	badgeClass: string;
}

/** Public navigation categories. Slugs match `posts.category` / `subreddits.category`. */
export const CATEGORIES: readonly Category[] = [
	{
		slug: "hoi-dap",
		label: "Hỏi đáp",
		description: "Câu hỏi thú vị và câu trả lời hay từ Reddit",
		badgeClass: "bg-cat-hoidap/10 text-cat-hoidap dark:bg-cat-hoidap/20",
	},
	{
		slug: "tifu",
		label: "Chuyện dở khóc dở cười",
		description: "Những pha tự làm khó mình",
		badgeClass: "bg-cat-tifu/10 text-cat-tifu dark:bg-cat-tifu/20",
	},
	{
		slug: "tinh-cam",
		label: "Tâm sự & Tình cảm",
		description: "Chuyện các mối quan hệ",
		badgeClass: "bg-cat-tinhcam/10 text-cat-tinhcam dark:bg-cat-tinhcam/20",
	},
	{
		slug: "kien-thuc",
		label: "Kiến thức",
		description: "Sự thật thú vị ít người biết",
		badgeClass: "bg-cat-kienthuc/10 text-cat-kienthuc dark:bg-cat-kienthuc/20",
	},
	{
		slug: "suy-ngam",
		label: "Suy ngẫm",
		description: "Những suy nghĩ khiến bạn gật gù",
		badgeClass: "bg-cat-suyngam/10 text-cat-suyngam dark:bg-cat-suyngam/20",
	},
	{
		slug: "meo-hay",
		label: "Mẹo hay",
		description: "Mẹo nhỏ cho cuộc sống dễ hơn",
		badgeClass: "bg-cat-meohay/10 text-cat-meohay dark:bg-cat-meohay/20",
	},
	{
		slug: "kinh-di",
		label: "Kinh dị",
		description: "Truyện rùng rợn tự sáng tác",
		badgeClass: "bg-cat-kinhdi/10 text-cat-kinhdi dark:bg-cat-kinhdi/20",
	},
];

const FALLBACK_BADGE_CLASS = "bg-stone-200/60 text-stone-600 dark:bg-stone-800 dark:text-stone-300";

const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function getCategory(slug: string): Category | undefined {
	return CATEGORY_BY_SLUG.get(slug);
}

export function categoryLabel(slug: string): string {
	return CATEGORY_BY_SLUG.get(slug)?.label ?? slug;
}

export function categoryBadgeClass(slug: string): string {
	return CATEGORY_BY_SLUG.get(slug)?.badgeClass ?? FALLBACK_BADGE_CLASS;
}
