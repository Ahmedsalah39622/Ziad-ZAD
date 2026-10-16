"use server";

import { db, discountCodes } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

function makeCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

export async function generateDiscountCodes(options: {
  quantity: number;
  discountPct: number;
  validDays?: number;
  usesPerCode: number;
}) {
  const expiresAt = options.validDays
    ? new Date(Date.now() + options.validDays * 24 * 60 * 60 * 1000)
    : null;

  const toInsert = [];
  for (let i = 0; i < options.quantity; i++) {
    toInsert.push({
      code: makeCode(10),
      discountPct: options.discountPct,
      usesPerCode: options.usesPerCode,
      expiresAt,
    });
  }

  if (toInsert.length > 0) {
    await db.insert(discountCodes).values(toInsert);
  }

  return toInsert;
}

export async function getDiscountCodes() {
  try {
    return await db.query.discountCodes.findMany({
      orderBy: (tbl, { desc }) => [desc(tbl.createdAt)],
    });
  } catch (e) {
    console.error("getDiscountCodes error", e);
    throw e;
  }
}

export async function redeemDiscountCode(code: string) {
  const dc = await db.query.discountCodes.findFirst({
    where: eq(discountCodes.code, code),
  });

  if (!dc) {
    throw new Error("Invalid discount code");
  }
  if (dc.expiresAt && dc.expiresAt < new Date()) {
    throw new Error("Discount code has expired");
  }
  if (dc.usedCount >= dc.usesPerCode) {
    throw new Error("Discount code has no uses remaining");
  }

  await db
    .update(discountCodes)
    .set({
      usedCount: sql`${discountCodes.usedCount} + 1`,
    })
    .where(eq(discountCodes.code, code));

  return dc;
}

export async function validateDiscountCode(code: string) {
  const dc = await db.query.discountCodes.findFirst({
    where: eq(discountCodes.code, code),
  });

  if (!dc) {
    throw new Error("Invalid discount code");
  }
  if (dc.expiresAt && dc.expiresAt < new Date()) {
    throw new Error("Discount code has expired");
  }
  if (dc.usedCount >= dc.usesPerCode) {
    throw new Error("Discount code has no uses remaining");
  }

  return dc;
}

export async function deleteDiscountCode(id: string) {
  try {
    await db.delete(discountCodes).where(eq(discountCodes.id, id));
    return { success: true };
  } catch (e) {
    console.error("deleteDiscountCode error", e);
    throw e;
  }
}

export async function updateDiscountCode(
  id: string,
  data: {
    code: string;
    discountPct: number;
    usesPerCode: number;
    usedCount: number;
    expiresAt: Date | null;
  }
) {
  try {
    await db
      .update(discountCodes)
      .set(data)
      .where(eq(discountCodes.id, id));

    return db.query.discountCodes.findFirst({
      where: eq(discountCodes.id, id),
    });
  } catch (e) {
    console.error("updateDiscountCode error", e);
    throw e;
  }
}
