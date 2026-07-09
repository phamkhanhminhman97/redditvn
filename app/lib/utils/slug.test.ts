import { describe, expect, test } from "vitest";
import { makeSlug, slugify } from "./slug";

describe("slugify", () => {
	test("strips Vietnamese diacritics to ASCII", () => {
		expect(slugify("Tiếng Việt")).toBe("tieng-viet");
	});

	test("maps đ and Đ to d", () => {
		expect(slugify("Đường phố Hà Nội")).toBe("duong-pho-ha-noi");
	});

	test("lowercases and kebab-cases", () => {
		expect(slugify("Reddit AMA với Elon")).toBe("reddit-ama-voi-elon");
	});

	test("preserves digits", () => {
		expect(slugify("Top 10 điều thú vị")).toBe("top-10-dieu-thu-vi");
	});

	test("collapses punctuation and emoji into single dashes", () => {
		expect(slugify("Wow!! 😮 Chuyện gì... vậy?")).toBe("wow-chuyen-gi-vay");
	});

	test("trims leading and trailing separators", () => {
		expect(slugify("  ...Xin chào!  ")).toBe("xin-chao");
	});

	test("returns empty string for punctuation-only input", () => {
		expect(slugify("!!!???")).toBe("");
		expect(slugify("😀🎉")).toBe("");
	});

	test("handles all Vietnamese tone marks", () => {
		// à á ả ã ạ / â ấ / ê ề / ô ố / ơ ớ / ư ứ
		expect(slugify("à á ả ã ạ")).toBe("a-a-a-a-a");
		expect(slugify("mùa hè rực rỡ")).toBe("mua-he-ruc-ro");
	});
});

describe("makeSlug", () => {
	test("appends the suffix for uniqueness", () => {
		expect(makeSlug("Chuyện lạ có thật", "1abc23")).toBe(
			"chuyen-la-co-that-1abc23",
		);
	});

	test("is deterministic (idempotent) for the same title + id", () => {
		const a = makeSlug("Hôm nay tôi đã ngu ngốc", "xyz789");
		const b = makeSlug("Hôm nay tôi đã ngu ngốc", "xyz789");
		expect(a).toBe(b);
	});

	test("falls back when the title has no slug-able characters", () => {
		expect(makeSlug("😀🎉", "abc123")).toBe("bai-viet-abc123");
	});

	test("caps the base length before the suffix", () => {
		const longTitle = "a".repeat(200);
		const slug = makeSlug(longTitle, "id42");
		expect(slug.length).toBeLessThanOrEqual(80 + 1 + "id42".length);
		expect(slug.endsWith("-id42")).toBe(true);
	});

	test("does not leave a trailing dash before the suffix", () => {
		// A title that would be truncated exactly at a dash boundary.
		const slug = makeSlug("từ nào cũng rất là dài dòng ", "id7");
		expect(slug).not.toContain("--");
	});
});
