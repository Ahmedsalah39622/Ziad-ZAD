import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.PRINT_AGENT_SECRET;
  if (!expected) return false;

  const provided = req.headers.get("x-print-agent-secret") || "";
  return provided === expected;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();

    // Store status and current time in SiteSetting
    await prisma.$transaction([
      prisma.siteSetting.upsert({
        where: { key: "printer_status" },
        update: { value: status || "online" },
        create: { key: "printer_status", value: status || "online" },
      }),
      prisma.siteSetting.upsert({
        where: { key: "printer_last_seen" },
        update: { value: new Date().toISOString() },
        create: { key: "printer_last_seen", value: new Date().toISOString() },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to record heartbeat", details: error instanceof Error ? error.message : "internal error" },
      { status: 500 }
    );
  }
}
