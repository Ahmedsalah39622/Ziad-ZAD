"use server";

import { Prisma } from "@prisma/client";

async function getPrisma() {
    const m = await import("@/lib/prisma");
    return m.prisma;
}

async function getAuth() {
    const m = await import("@/lib/auth");
    return m.auth;
}

async function requireAdmin() {
    const auth = await getAuth();
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
    return session;
}

function isTransientConnectionError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P1017") {
        return true;
    }

    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        return msg.includes("server has closed the connection") || msg.includes("connection") && msg.includes("closed");
    }

    return false;
}

async function withPrismaRetry<T>(operation: (prisma: Awaited<ReturnType<typeof getPrisma>>) => Promise<T>): Promise<T> {
    const prisma = await getPrisma();

    try {
        return await operation(prisma);
    } catch (error) {
        if (!isTransientConnectionError(error)) {
            throw error;
        }

        await prisma.$disconnect();
        const freshPrisma = await getPrisma();
        return operation(freshPrisma);
    }
}

export async function getCategories() {
    return withPrismaRetry((prisma) => prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
    }));
}

export async function createCategory(data: { name: string; slug: string }) {
    await requireAdmin();
    return withPrismaRetry((prisma) => prisma.category.create({ data }));
}

export async function updateCategory(
    id: string,
    data: { name?: string; slug?: string }
) {
    await requireAdmin();
    return withPrismaRetry((prisma) => prisma.category.update({ where: { id }, data }));
}

export async function deleteCategory(id: string) {
    await requireAdmin();
    return withPrismaRetry(async (prisma) => {
        // Check if any products use this category
        const count = await prisma.product.count({ where: { categoryId: id } });
        if (count > 0) {
            throw new Error("Cannot delete category with products");
        }
        return prisma.category.delete({ where: { id } });
    });
}
