import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@/db/schema";

// ─── Connection Configuration ─────────────────────────────────────────
function parseDatabaseUrl(urlStr: string): mysql.PoolOptions {
  if (!urlStr) {
    console.error("[ZAD][db] DATABASE_URL is not set!");
    return { host: "127.0.0.1", port: 3306 };
  }

  try {
    const parsed = new URL(urlStr);
    return {
      host: parsed.hostname || "127.0.0.1",
      port: parsed.port ? parseInt(parsed.port, 10) : 3306,
      user: decodeURIComponent(parsed.username || ""),
      password: decodeURIComponent(parsed.password || ""),
      database: parsed.pathname.replace(/^\//, ""),
      ssl: parsed.searchParams.get("ssl") === "true" ? { rejectUnauthorized: false } : undefined,
    };
  } catch {
    // If not standard URL format, pass uri directly
    return { uri: urlStr };
  }
}

const poolConfig: mysql.PoolOptions = {
  ...parseDatabaseUrl(process.env.DATABASE_URL || ""),
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 5,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

// Singleton pool across Next.js HMR reloads
const globalForDb = globalThis as unknown as {
  mysqlPool: mysql.Pool | undefined;
};

export const pool = globalForDb.mysqlPool ?? mysql.createPool(poolConfig);

if (process.env.NODE_ENV !== "production") {
  globalForDb.mysqlPool = pool;
}

export const db = drizzle(pool, { schema, mode: "default" });

export * from "@/db/schema";
