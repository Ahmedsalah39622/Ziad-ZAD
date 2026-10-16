// This file is kept for backward-compatibility.
// The project now uses Drizzle ORM + mysql2 (no Prisma binaries or engines).
export { db, pool } from "@/lib/db";
export * from "@/db/schema";
