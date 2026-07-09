import { describe, expect, test } from "vitest";
import {
	buildCommentsUserContent,
	buildPostUserContent,
	TRANSLATION_SYSTEM_PROMPT,
} from "./prompt";

describe("TRANSLATION_SYSTEM_PROMPT", () => {
	test("instructs localized, non-literal Vietnamese translation", () => {
		expect(TRANSLATION_SYSTEM_PROMPT).toContain("THOÁT Ý");
		expect(TRANSLATION_SYSTEM_PROMPT).toContain("RedditVN");
	});
});

describe("buildPostUserContent", () => {
	test("includes subreddit, title and body", () => {
		const out = buildPostUserContent({
			subreddit: "AskReddit",
			titleEn: "What is your favorite food?",
			bodyEn: "I like pho.",
		});
		expect(out).toContain("r/AskReddit");
		expect(out).toContain("What is your favorite food?");
		expect(out).toContain("I like pho.");
		expect(out).toContain("title_vi");
		expect(out).toContain("body_vi");
	});

	test("marks empty body explicitly instead of leaving a blank", () => {
		const out = buildPostUserContent({
			subreddit: "tifu",
			titleEn: "TIFU by sleeping in",
			bodyEn: "   ",
		});
		expect(out).toContain("(bài không có nội dung văn bản)");
	});
});

describe("buildCommentsUserContent", () => {
	test("numbers comments and preserves ids and authors", () => {
		const out = buildCommentsUserContent([
			{ id: "c1", author: "alice", bodyEn: "First!" },
			{ id: "c2", bodyEn: "Second." },
		]);
		expect(out).toContain("id: c1, tác giả: alice");
		expect(out).toContain("id: c2");
		expect(out).toContain("First!");
		expect(out).toContain("Second.");
		expect(out).toContain("#1");
		expect(out).toContain("#2");
	});
});
