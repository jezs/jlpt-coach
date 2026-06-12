import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use the session pooler (port 5432) or direct URL for migrations.
    // Transaction pooler (port 6543, pgbouncer=true) breaks Prisma schema push.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
