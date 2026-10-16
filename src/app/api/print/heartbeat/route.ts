import { NextRequest, NextResponse } from "next/server";
import { db, siteSettings } from "@/lib/db";
import { eq } from "drizzle-orm";

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.PRINT_AGENT_SECRET;
  if (!expected) return false;

  const provided = req.headers.get("x-print-agent-secret") || "";
  return provided === expected;
}

async function upsertSetting(key: string, value: string) {
  const existing = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, key),
  });

  if (existing) {
    await db
      .update(siteSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(siteSettings.key, key));
  } else {
    await db.insert(siteSettings).values({ key, value });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();

    await upsertSetting("printer_status", status || "online");
    await upsertSetting("printer_last_seen", new Date().toISOString());

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to record heartbeat",
        details: error instanceof Error ? error.message : "internal error",
      },
      { status: 500 }
    );
  }
}
