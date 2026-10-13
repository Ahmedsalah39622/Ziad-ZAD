import { PrismaClient } from "@prisma/client";

// ─── Connection-pool tuning ────────────────────────────────────────────────
// Hostinger MySQL closes idle connections after ~3 600 s (wait_timeout).
// Setting connection_limit low keeps us within the shared-hosting cap and
// socket_timeout / connect_timeout guard against hangs.
type PrismaLogLevel = NonNullable<NonNullable<ConstructorParameters<typeof PrismaClient>[0]>["log"]>;

const DB_LOG_LEVEL: PrismaLogLevel =
    process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"];

function createPrismaClient() {
    return new PrismaClient({
        log: DB_LOG_LEVEL,
        datasources: {
            db: {
                url: buildDatabaseUrl(),
            },
        },
    });
}

/** Append Prisma connection-pool query-params that prevent stale-connection errors.
 *
 * IMPORTANT: We use string manipulation instead of `new URL()` because the
 * DATABASE_URL password may contain percent-encoded special chars (e.g. %26 for &)
 * that `new URL()` decodes and then re-encodes differently, corrupting credentials.
 */
function buildDatabaseUrl(): string {
    const base = process.env.DATABASE_URL ?? "";
    if (!base) {
        console.error("[ZAD][prisma] DATABASE_URL is not set!");
        return base;
    }

    // Only patch MySQL / MariaDB URLs
    if (!base.startsWith("mysql://") && !base.startsWith("mariadb://")) {
        return base;
    }

    // Params we want to ensure exist (only added if not already present)
    const defaults: Record<string, string> = {
        connection_limit: "5",   // keep pool small on shared hosting
        pool_timeout: "20",      // seconds to wait for a free connection
        connect_timeout: "10",   // seconds to wait for TCP connect
        socket_timeout: "3500",  // seconds before we drop an idle socket
    };

    // Split off the existing query string (if any)
    const qIdx = base.indexOf("?");
    const urlBase = qIdx === -1 ? base : base.slice(0, qIdx);
    const existingQs = qIdx === -1 ? "" : base.slice(qIdx + 1);

    // Parse existing params so we don't duplicate them
    const existing = new Set(
        existingQs
            .split("&")
            .filter(Boolean)
            .map((pair) => pair.split("=")[0])
    );

    const extra = Object.entries(defaults)
        .filter(([key]) => !existing.has(key))
        .map(([key, val]) => `${key}=${val}`)
        .join("&");

    if (!extra) return base; // nothing to add

    const sep = existingQs ? "&" : "?";
    return `${urlBase}${qIdx === -1 ? "?" : sep}${existingQs ? existingQs + "&" : ""}${extra}`;
}


// ─── Singleton ────────────────────────────────────────────────────────────
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
    globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

// ─── Reconnect helper ────────────────────────────────────────────────────
/** Error codes / messages that indicate a severed TCP connection to MySQL. */
const RECONNECT_CODES = new Set([
    "P1001", // Can't reach database server
    "P1002", // Database server was reached but timed out
    "P1008", // Operations timed out
    "P1017", // Server has closed the connection
]);

function isDisconnectError(err: unknown): boolean {
    if (!err || typeof err !== "object") return false;
    const e = err as Record<string, unknown>;

    // Prisma error codes
    if (typeof e.code === "string" && RECONNECT_CODES.has(e.code)) return true;

    // Raw MySQL error messages
    const msg = (typeof e.message === "string" ? e.message : "").toLowerCase();
    return (
        msg.includes("connection") &&
        (msg.includes("closed") ||
            msg.includes("lost") ||
            msg.includes("reset") ||
            msg.includes("refused") ||
            msg.includes("timeout") ||
            msg.includes("gone away"))
    );
}

/**
 * Run `fn` against Prisma, transparently reconnecting once if the DB
 * dropped the connection (Hostinger MySQL idle timeout, etc.).
 *
 * Usage:
 *   const result = await withRetry(() => prisma.order.findMany(...));
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        if (retries > 0 && isDisconnectError(err)) {
            console.warn("[ZAD][prisma] DB connection lost – reconnecting…");
            try {
                await prisma.$disconnect();
            } catch {
                // ignore
            }
            try {
                await prisma.$connect();
            } catch {
                // ignore – next query will try again
            }
            return withRetry(fn, retries - 1);
        }
        throw err;
    }
}
