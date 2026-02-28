"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Get a single site setting by key.
 */
export async function getSetting(key: string, defaultValue: string = "") {
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key },
        });
        return setting?.value ?? defaultValue;
    } catch (error) {
        console.error(`Failed to fetch setting ${key}:`, error);
        return defaultValue;
    }
}

/**
 * Set a site setting and revalidate the layout.
 */
export async function setSetting(key: string, value: string) {
    try {
        await prisma.siteSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });

        // Revalidation happens globally to instantly show the ribbon 
        // across all cached pages where the header/hero is.
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error(`Failed to set setting ${key}:`, error);
        return { success: false, error: "Failed to update setting." };
    }
}

/**
 * Upload a hero image from base64 and return the base64 data.
 * In a serverless environment like Vercel, we can't save to the filesystem,
 * so we store the base64 string directly in the database.
 */
export async function uploadHeroImage(base64Data: string) {
    try {
        // Just return the base64 data to be stored in the database
        return { success: true, path: base64Data };
    } catch (error) {
        console.error("Upload failed:", error);
        return { success: false, error: "Upload failed." };
    }
}

/**
 * Upload a feature background image from base64 and return the base64 data.
 */
export async function uploadFeatureImage(base64Data: string) {
    try {
        // Just return the base64 data to be stored in the database
        return { success: true, path: base64Data };
    } catch (error) {
        console.error("Feature upload failed:", error);
        return { success: false, error: "Upload failed." };
    }
}
