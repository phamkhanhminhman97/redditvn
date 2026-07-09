import { z } from "zod";
import { type ClaudeConfig, callClaudeJson } from "./client";
import {
	buildCommentsUserContent,
	buildPostUserContent,
	type CommentToTranslate,
	type PostToTranslate,
	TRANSLATION_SYSTEM_PROMPT,
} from "./prompt";

// --- JSON schemas for output_config.format (all objects: additionalProperties:false) ---

const POST_JSON_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		title_vi: { type: "string" },
		body_vi: { type: "string" },
	},
	required: ["title_vi", "body_vi"],
} as const;

const COMMENTS_JSON_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		comments: {
			type: "array",
			items: {
				type: "object",
				additionalProperties: false,
				properties: {
					id: { type: "string" },
					body_vi: { type: "string" },
				},
				required: ["id", "body_vi"],
			},
		},
	},
	required: ["comments"],
} as const;

// --- Zod validators (boundary validation of the model's output) ---

const postResultSchema = z.object({
	title_vi: z.string(),
	body_vi: z.string(),
});

const commentsResultSchema = z.object({
	comments: z.array(z.object({ id: z.string(), body_vi: z.string() })),
});

export interface TranslatedPost {
	titleVi: string;
	bodyVi: string;
}

export async function translatePost(
	config: ClaudeConfig,
	input: PostToTranslate,
): Promise<TranslatedPost> {
	const raw = await callClaudeJson(config, {
		system: TRANSLATION_SYSTEM_PROMPT,
		userContent: buildPostUserContent(input),
		schema: POST_JSON_SCHEMA,
	});
	const parsed = postResultSchema.parse(raw);
	return { titleVi: parsed.title_vi, bodyVi: parsed.body_vi };
}

/** Map of Reddit comment id -> translated Vietnamese body. */
export async function translateComments(
	config: ClaudeConfig,
	comments: readonly CommentToTranslate[],
): Promise<Map<string, string>> {
	if (comments.length === 0) return new Map();
	const raw = await callClaudeJson(config, {
		system: TRANSLATION_SYSTEM_PROMPT,
		userContent: buildCommentsUserContent(comments),
		schema: COMMENTS_JSON_SCHEMA,
	});
	const parsed = commentsResultSchema.parse(raw);
	return new Map(parsed.comments.map((c) => [c.id, c.body_vi]));
}
