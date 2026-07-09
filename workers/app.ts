import { createRequestHandler } from "react-router";
import { runPipeline } from "~/lib/pipeline/run";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	fetch(request, env, ctx) {
		return requestHandler(request, {
			cloudflare: { env, ctx },
		});
	},

	// Cron trigger: content pipeline (fetch → translate → draft). See wrangler.jsonc.
	async scheduled(_controller, env, _ctx) {
		const result = await runPipeline(env);
		console.log("[pipeline] run complete", JSON.stringify(result));
	},
} satisfies ExportedHandler<Env>;
