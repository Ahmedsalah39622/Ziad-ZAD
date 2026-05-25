"use server";

// directly import prisma client (server-only code)
import { prisma } from "@/lib/prisma";

// generate a random alphanumeric code
function makeCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let str = '';
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
    const codes = [];
    const expiresAt = options.validDays ? new Date(Date.now() + options.validDays * 24 * 60 * 60 * 1000) : null;
    for (let i = 0; i < options.quantity; i++) {
        const code = makeCode(10);
        codes.push(
            prisma.discountCode.create({
                data: {
                    code,
                    discountPct: options.discountPct,
                    usesPerCode: options.usesPerCode,
                    expiresAt,
                },
            })
        );
    }
    return await Promise.all(codes);
}

export async function getDiscountCodes() {
    try {
        return await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } });
    } catch (e) {
        console.error("prisma.getDiscountCodes error", e);
        throw e;
    }
}

// called when a customer attempts to apply a code
export async function redeemDiscountCode(code: string) {
    const dc = await prisma.discountCode.findUnique({ where: { code } });
    if (!dc) {
        throw new Error('Invalid discount code');
    }
    if (dc.expiresAt && dc.expiresAt < new Date()) {
        throw new Error('Discount code has expired');
    }
    if (dc.usedCount >= dc.usesPerCode) {
        throw new Error('Discount code has no uses remaining');
    }
    await prisma.discountCode.update({
        where: { code },
        data: { usedCount: { increment: 1 } },
    });
    return dc;
}
// called when a customer attempts to apply a code to see if it's valid
export async function validateDiscountCode(code: string) {
    const dc = await prisma.discountCode.findUnique({ where: { code } });
    if (!dc) {
        throw new Error('Invalid discount code');
    }
    if (dc.expiresAt && dc.expiresAt < new Date()) {
        throw new Error('Discount code has expired');
    }
    if (dc.usedCount >= dc.usesPerCode) {
        throw new Error('Discount code has no uses remaining');
    }
    return dc;
}

export async function deleteDiscountCode(id: string) {
    try {
        return await prisma.discountCode.delete({ where: { id } });
    } catch (e) {
        console.error("prisma.deleteDiscountCode error", e);
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
        return await prisma.discountCode.update({
            where: { id },
            data,
        });
    } catch (e) {
        console.error("prisma.updateDiscountCode error", e);
        throw e;
    }
}

