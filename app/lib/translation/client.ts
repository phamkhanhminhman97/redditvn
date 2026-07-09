const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MAX_TOKENS = 8192;
const MAX_RETRIES = 3;
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 529]);

export interface ClaudeConfig {
	apiKey: string;
	model: string;
	maxTokens?: number;
}

export class AnthropicError extends Error {
	constructor(
		readonly status: number,
		message: string,
	) {
		super(message);
		this.name = "AnthropicError";
	}
}

interface JsonRequest {
	system: string;
	userContent: string;
	/** JSON Schema for output_config.format (objects must set additionalProperties:false). */
	schema: Record<string, unknown>;
}

interface AnthropicContentBlock {
	type: string;
	text?: string;
}
interface AnthropicMessage {
	content: AnthropicContentBlock[];
	stop_reason: string | null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Call the Messages API and return the parsed JSON object from the response.
 * Uses output_config.format for schema-constrained output, and falls back to
 * extracting the first JSON object from the text if direct parsing fails.
 * Retries transient (429/5xx) failures with exponential backoff.
 */
export async function callClaudeJson(
	config: ClaudeConfig,
	req: JsonRequest,
): Promise<unknown> {
	const body = JSON.stringify({
		model: config.model,
		max_tokens: config.maxTokens ?? DEFAULT_MAX_TOKENS,
		thinking: { type: "disabled" },
		system: req.system,
		messages: [{ role: "user", content: req.userContent }],
		output_config: { format: { type: "json_schema", schema: req.schema } },
	});

	let lastError: AnthropicError | null = null;
	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		if (attempt > 0) await sleep(2 ** attempt * 500);

		const res = await fetch(ANTHROPIC_API_URL, {
			method: "POST",
			headers: {
				"x-api-key": config.apiKey,
				"anthropic-version": ANTHROPIC_VERSION,
				"content-type": "application/json",
			},
			body,
		});

		if (res.ok) {
			const data = (await res.json()) as AnthropicMessage;
			if (data.stop_reason === "refusal") {
				throw new AnthropicError(200, "Model refused to translate this content");
			}
			return parseJsonFromText(extractText(data));
		}

		const errorText = await res.text();
		lastError = new AnthropicError(res.status, errorText);
		if (!RETRYABLE_STATUS.has(res.status)) throw lastError;
	}
	throw lastError ?? new AnthropicError(0, "Unknown Anthropic error");
}

function extractText(message: AnthropicMessage): string {
	return message.content
		.filter((b) => b.type === "text" && typeof b.text === "string")
		.map((b) => b.text)
		.join("");
}

/** Parse JSON, tolerating any accidental prose around the object. */
function parseJsonFromText(text: string): unknown {
	try {
		return JSON.parse(text);
	} catch {
		const start = text.indexOf("{");
		const end = text.lastIndexOf("}");
		if (start !== -1 && end > start) {
			return JSON.parse(text.slice(start, end + 1));
		}
		throw new AnthropicError(200, "Response was not valid JSON");
	}
}
