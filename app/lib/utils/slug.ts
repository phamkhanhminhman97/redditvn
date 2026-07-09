const SLUG_MAX_LENGTH = 80;
const SLUG_FALLBACK = "bai-viet";

// Combining diacritical marks (U+0300–U+036F), left over after NFD normalize.
const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * Convert arbitrary (incl. Vietnamese) text into a URL-safe slug.
 * Strips diacritics, maps đ→d, lowercases, and kebab-cases alphanumerics.
 * Pure & deterministic.
 */
export function slugify(input: string): string {
	return input
		.normalize("NFD")
		.replace(COMBINING_MARKS, "")
		.toLowerCase()
		.replace(/đ/g, "d")
		.replace(/[^a-z0-9]+/g, "-") // non-alphanumeric runs → single dash
		.replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
}

/**
 * Build a stable, unique post slug: `slugified-title-<suffix>`.
 * The suffix (typically the Reddit base-36 id) keeps the slug unique and
 * deterministic for the same post, so re-runs don't create duplicates.
 */
export function makeSlug(title: string, suffix: string): string {
	const base =
		slugify(title).slice(0, SLUG_MAX_LENGTH).replace(/-+$/, "") ||
		SLUG_FALLBACK;
	const cleanSuffix = slugify(suffix);
	return cleanSuffix ? `${base}-${cleanSuffix}` : base;
}
