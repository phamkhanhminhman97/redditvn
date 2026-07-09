import { defineConfig } from "drizzle-kit";

// Generates SQL migrations from the Drizzle schema into drizzle/migrations.
// Migrations are applied to D1 via `wrangler d1 migrations apply` (see package.json
// db:migrate:* scripts), so no remote driver/credentials are needed here.
export default defineConfig({
	schema: "./app/lib/db/schema.ts",
	out: "./drizzle/migrations",
	dialect: "sqlite",
});
