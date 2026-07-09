const XML_ENTITIES: Record<string, string> = {
	"<": "&lt;",
	">": "&gt;",
	"&": "&amp;",
	"'": "&apos;",
	'"': "&quot;",
};

export function escapeXml(input: string): string {
	return input.replace(/[<>&'"]/g, (c) => XML_ENTITIES[c] ?? c);
}
