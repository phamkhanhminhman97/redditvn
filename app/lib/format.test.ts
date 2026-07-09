import { describe, expect, test } from "vitest";
import { formatCompact, formatRelativeTime, toParagraphs } from "./format";

describe("formatRelativeTime", () => {
	const now = new Date("2026-07-09T12:00:00Z");
	test("just now under a minute", () => {
		expect(formatRelativeTime(new Date("2026-07-09T11:59:30Z"), now)).toBe("vừa xong");
	});
	test("minutes, hours, days", () => {
		expect(formatRelativeTime(new Date("2026-07-09T11:30:00Z"), now)).toBe("30 phút trước");
		expect(formatRelativeTime(new Date("2026-07-09T09:00:00Z"), now)).toBe("3 giờ trước");
		expect(formatRelativeTime(new Date("2026-07-07T12:00:00Z"), now)).toBe("2 ngày trước");
	});
	test("never returns negative for future dates", () => {
		expect(formatRelativeTime(new Date("2026-07-09T13:00:00Z"), now)).toBe("vừa xong");
	});
});

describe("formatCompact", () => {
	test("keeps small numbers", () => {
		expect(formatCompact(342)).toBe("342");
	});
	test("compacts thousands", () => {
		expect(formatCompact(45200)).toBe("45.2k");
		expect(formatCompact(120000)).toBe("120k");
		expect(formatCompact(5400)).toBe("5.4k");
		expect(formatCompact(1000)).toBe("1k");
	});
});

describe("toParagraphs", () => {
	test("splits on blank lines and trims", () => {
		expect(toParagraphs("A\n\nB\n\n\nC")).toEqual(["A", "B", "C"]);
	});
	test("drops empty input", () => {
		expect(toParagraphs("   \n\n  ")).toEqual([]);
	});
});
