import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Unit tests for framework-agnostic domain logic (node env, no Workers runtime).
// DB/integration tests can later use @cloudflare/vitest-pool-workers separately.
export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		environment: "node",
		include: ["app/**/*.test.ts"],
	},
});
