import { NextRequest, NextResponse } from "next/server";
import { db, siteSettings } from "@/lib/db";
import { eq } from "drizzle-orm";

const PRINTED_IDS_KEY = "print_agent_printed_order_ids";

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.PRINT_AGENT_SECRET;
  if (!expected) return false;

  const provided = req.headers.get("x-print-agent-secret") || "";
  return provided === expected;
}

async function readPrintedIds(): Promise<string[]> {
  const setting = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, PRINTED_IDS_KEY),
    columns: { value: true },
  });

  if (!setting?.value) return [];

  try {
    const parsed = JSON.parse(setting.value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === "string");
  } catch {
    return [];
  }
}

async function writePrintedIds(ids: string[]) {
  const existing = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, PRINTED_IDS_KEY),
  });

  const value = JSON.stringify(ids);

  if (existing) {
    await db
      .update(siteSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(siteSettings.key, PRINTED_IDS_KEY));
  } else {
    await db.insert(siteSettings).values({ key: PRINTED_IDS_KEY, value });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const ids = Array.isArray(body?.ids)
      ? body.ids.filter((id: unknown) => typeof id === "string")
      : [];

    if (!ids.length) {
      return NextResponse.json({ ok: true, message: "No ids to ack" });
    }

    const current = await readPrintedIds();
    const merged = Array.from(new Set([...current, ...ids]));
    const trimmed = merged.slice(Math.max(0, merged.length - 5000));

    await writePrintedIds(trimmed);

    return NextResponse.json({ ok: true, acknowledged: ids.length });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to acknowledge printed orders",
        details: error instanceof Error ? error.message : "internal error",
      },
      { status: 500 }
    );
  }
}
