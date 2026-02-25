"use server";

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

export async function getCategories() {
    const prisma = await getPrisma();
    return prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
    });
}

export async function createCategory(data: { name: string; slug: string }) {
    await requireAdmin();
    const prisma = await getPrisma();
    return prisma.category.create({ data });
}

export async function updateCategory(
    id: string,
    data: { name?: string; slug?: string }
) {
    await requireAdmin();
    const prisma = await getPrisma();
    return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
    await requireAdmin();
    // Check if any products use this category
    const prisma = await getPrisma();
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
        throw new Error("Cannot delete category with products");
    }
    return prisma.category.delete({ where: { id } });
}
