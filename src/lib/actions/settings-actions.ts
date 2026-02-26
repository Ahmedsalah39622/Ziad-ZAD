"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

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
 * Upload a hero image from base64 and return the public path.
 */
export async function uploadHeroImage(base64Data: string, fileName: string) {
    try {
        const base64Content = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
        const buffer = Buffer.from(base64Content, "base64");
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);

        return { success: true, path: `/uploads/${fileName}` };
    } catch (error) {
        console.error("Upload failed:", error);
        return { success: false, error: "Upload failed." };
    }
}
