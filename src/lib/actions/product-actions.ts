"use server";

// Lazily import server-only utilities to avoid client bundling
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

export async function getProducts(search?: string) {
    const where = search
        ? { name: { contains: search } }
        : {};
    const prisma = await getPrisma();
    return prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
    });
}

export async function getProductById(id: string) {
    const prisma = await getPrisma();
    return prisma.product.findUnique({
        where: { id },
        include: { category: true },
    });
}

export async function createProduct(data: {
    name: string;
    price: number;
    description: string;
    details: string[];
    images: string[];
    sizes: string[];
    colors: { name: string; hex: string }[];
    categoryId?: string;
    stock: number;
    tag?: string;
    active?: boolean;
}) {
    await requireAdmin();
    const prisma = await getPrisma();
    return prisma.product.create({
        data: {
            name: data.name,
            price: data.price,
            description: data.description,
            details: JSON.stringify(data.details),
            // The images comes as a list of JSON strings from the client or raw strings
            // We ensure it is stored as a valid JSON array of objects
            images: JSON.stringify(data.images.map(img => {
                try {
                    return JSON.parse(img);
                } catch {
                    return { url: img };
                }
            })),
            sizes: JSON.stringify(data.sizes),
            colors: JSON.stringify(data.colors),
            categoryId: data.categoryId || null,
            stock: data.stock,
            tag: data.tag || null,
            active: data.active ?? true,
        },
    });
}

export async function updateProduct(
    id: string,
    data: {
        name?: string;
        price?: number;
        description?: string;
        details?: string[];
        images?: string[];
        sizes?: string[];
        colors?: { name: string; hex: string }[];
        categoryId?: string;
        stock?: number;
        tag?: string;
        active?: boolean;
    }
) {
    await requireAdmin();

    const prisma = await getPrisma();
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.details !== undefined) updateData.details = JSON.stringify(data.details);
    if (data.images !== undefined) {
        updateData.images = JSON.stringify(data.images.map(img => {
            try {
                return JSON.parse(img);
            } catch {
                return { url: img };
            }
        }));
    }
    if (data.sizes !== undefined) updateData.sizes = JSON.stringify(data.sizes);
    if (data.colors !== undefined) updateData.colors = JSON.stringify(data.colors);
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.tag !== undefined) updateData.tag = data.tag || null;
    if (data.active !== undefined) updateData.active = data.active;

    return prisma.product.update({ where: { id }, data: updateData });
}

export async function deleteProduct(id: string) {
    await requireAdmin();
    const prisma = await getPrisma();
    return prisma.product.delete({ where: { id } });
}
