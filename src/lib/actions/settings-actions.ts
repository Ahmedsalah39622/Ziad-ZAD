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
