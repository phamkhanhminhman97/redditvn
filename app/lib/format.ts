const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;

/** Vietnamese relative time, e.g. "3 giờ trước". `now` is injectable for testing. */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
	const seconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
	if (seconds < MINUTE) return "vừa xong";
	if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)} phút trước`;
	if (seconds < DAY) return `${Math.floor(seconds / HOUR)} giờ trước`;
	if (seconds < DAY * 30) return `${Math.floor(seconds / DAY)} ngày trước`;
	if (seconds < DAY * 365) return `${Math.floor(seconds / (DAY * 30))} tháng trước`;
	return `${Math.floor(seconds / (DAY * 365))} năm trước`;
}

/** Compact number for scores, e.g. 45200 -> "45.2k". */
export function formatCompact(n: number): string {
	if (n < 1000) return String(n);
	const thousands = n / 1000;
	const rounded = thousands >= 100 ? Math.round(thousands) : Math.round(thousands * 10) / 10;
	return `${String(rounded).replace(/\.0$/, "")}k`;
}

/** Split markdown-ish text into paragraphs on blank lines (safe, no HTML). */
export function toParagraphs(text: string): string[] {
	return text
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter((p) => p.length > 0);
}
