"use server";

import { revalidatePath } from "next/cache";

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

type ProductSort = "featured" | "newest" | "price-desc" | "price-asc";

type ProductQueryOptions = {
    search?: string;
    sort?: ProductSort;
};

export async function getProducts(options?: string | ProductQueryOptions) {
    const query = typeof options === "string" ? { search: options } : (options || {});
    const where = query.search
        ? { name: { contains: query.search } }
        : {};
    const prisma = await getPrisma();
    const orderBy =
        query.sort === "price-desc"
            ? [{ price: "desc" as const }, { createdAt: "desc" as const }]
            : query.sort === "price-asc"
                ? [{ price: "asc" as const }, { createdAt: "desc" as const }]
                : query.sort === "newest"
                    ? [{ createdAt: "desc" as const }]
                    : [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];

    return prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
    });
}

export async function getProductById(id: string) {
    const prisma = await getPrisma();
    return prisma.product.findUnique({
        where: { id },
        include: { category: true },
    });
}

export async function createProduct({ payload }: { payload: string }) {
    await requireAdmin();
    const data = JSON.parse(payload) as {
        name: string;
        price: number;
        description: string;
        details: string[];
        images: { url: string; color?: string }[];
        sizes: { name: string; stock: number }[];
        colors: { name: string; hex: string }[];
        categoryId?: string;
        stock: number;
        tag?: string;
        active?: boolean;
        compareAtPrice?: number | null;
    };

    const prisma = await getPrisma();
    const maxSortOrder = (await prisma.product.aggregate({ _max: { sortOrder: true } }))._max.sortOrder;
    const product = await prisma.product.create({
        data: {
            name: data.name,
            price: data.price,
            compareAtPrice: data.compareAtPrice || null,
            description: data.description,
            details: JSON.stringify(data.details),
            // The images are now objects directly
            images: JSON.stringify(data.images),
            sizes: JSON.stringify(data.sizes),
            colors: JSON.stringify(data.colors),
            categoryId: data.categoryId || null,
            stock: data.stock,
            tag: data.tag || null,
            active: data.active ?? true,
            sortOrder: (maxSortOrder ?? -1) + 1,
        },
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return product;
}

export async function updateProduct(
    id: string,
    data: {
        name?: string;
        price?: number;
        description?: string;
        details?: string[];
        images?: { url: string; color?: string }[];
        sizes?: { name: string; stock: number }[];
        colors?: { name: string; hex: string }[];
        categoryId?: string;
        stock?: number;
        tag?: string;
        active?: boolean;
        compareAtPrice?: number | null;
        sortOrder?: number;
    }
) {
    await requireAdmin();

    const prisma = await getPrisma();
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.compareAtPrice !== undefined) updateData.compareAtPrice = data.compareAtPrice;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.details !== undefined) updateData.details = JSON.stringify(data.details);
    if (data.images !== undefined) {
        updateData.images = JSON.stringify(data.images);
    }
    if (data.sizes !== undefined) updateData.sizes = JSON.stringify(data.sizes);
    if (data.colors !== undefined) updateData.colors = JSON.stringify(data.colors);
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.tag !== undefined) updateData.tag = data.tag || null;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    const product = await prisma.product.update({ where: { id }, data: updateData });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/shop/${id}`);
    revalidatePath("/admin/products");
    return product;
}

export async function deleteProduct(id: string) {
    await requireAdmin();
    const prisma = await getPrisma();
    const product = await prisma.product.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/shop/${id}`);
    revalidatePath("/admin/products");
    return product;
}

export async function updateProductPrices(id: string, price: number, compareAtPrice: number | null) {
    await requireAdmin();
    const prisma = await getPrisma();
    const product = await prisma.product.update({
        where: { id },
        data: { price, compareAtPrice },
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/shop/${id}`);
    revalidatePath("/admin/products");
    return product;
}

export async function moveProductOrder(id: string, direction: "up" | "down") {
    await requireAdmin();

    const prisma = await getPrisma();
    const products = await prisma.product.findMany({
        select: { id: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    const currentIndex = products.findIndex((product) => product.id === id);
    if (currentIndex === -1) {
        throw new Error("Product not found");
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= products.length) {
        return null;
    }

    const reordered = [...products];
    const [movedProduct] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, movedProduct);

    await prisma.$transaction(
        reordered.map((product, index) =>
            prisma.product.update({
                where: { id: product.id },
                data: { sortOrder: index },
            })
        )
    );

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return true;
}
