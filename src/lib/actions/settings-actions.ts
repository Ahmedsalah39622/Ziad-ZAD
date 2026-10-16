"use server";

import { revalidatePath } from "next/cache";
import { db, siteSettings } from "@/lib/db";
import { eq } from "drizzle-orm";

const DATABASE_FAILURE_COOLDOWN_MS = 30_000;
let databaseUnavailableUntil = 0;

function isDatabaseTemporarilyUnavailable() {
  return Date.now() < databaseUnavailableUntil;
}

/**
 * Get a single site setting by key.
 */
export async function getSetting(key: string, defaultValue: string = ""): Promise<string> {
  if (isDatabaseTemporarilyUnavailable()) {
    return defaultValue;
  }

  try {
    const setting = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, key),
    });
    return setting?.value ?? defaultValue;
  } catch {
    databaseUnavailableUntil = Date.now() + DATABASE_FAILURE_COOLDOWN_MS;
    console.warn(`[ZAD][db] Database unavailable while fetching setting "${key}"; using default value.`);
    return defaultValue;
  }
}

/**
 * Set a site setting and revalidate the layout.
 */
export async function setSetting(key: string, value: string) {
  if (isDatabaseTemporarilyUnavailable()) {
    return { success: false, error: "Database temporarily unavailable." };
  }

  try {
    const existing = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, key),
    });

    if (existing) {
      await db
        .update(siteSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(siteSettings.key, key));
    } else {
      await db.insert(siteSettings).values({
        key,
        value,
      });
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    databaseUnavailableUntil = Date.now() + DATABASE_FAILURE_COOLDOWN_MS;
    console.error(`[ZAD][db] Failed to set setting "${key}":`, error);
    return { success: false, error: "Failed to update setting." };
  }
}

export async function uploadHeroImage(base64Data: string) {
  try {
    return { success: true, path: base64Data };
  } catch (error) {
    console.error("Upload failed:", error);
    return { success: false, error: "Upload failed." };
  }
}

export async function uploadFeatureImage(base64Data: string) {
  try {
    return { success: true, path: base64Data };
  } catch (error) {
    console.error("Feature upload failed:", error);
    return { success: false, error: "Upload failed." };
  }
}
