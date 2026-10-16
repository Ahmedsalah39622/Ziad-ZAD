"use server";

import { revalidatePath } from "next/cache";
import { db, products } from "@/lib/db";
import { eq, like, desc, asc, max } from "drizzle-orm";

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
  try {
    const query = typeof options === "string" ? { search: options } : options || {};
    const searchFilter = query.search
      ? like(products.name, `%${query.search}%`)
      : undefined;

    let orderBy;
    if (query.sort === "price-desc") {
      orderBy = [desc(products.price), desc(products.createdAt)];
    } else if (query.sort === "price-asc") {
      orderBy = [asc(products.price), desc(products.createdAt)];
    } else if (query.sort === "newest") {
      orderBy = [desc(products.createdAt)];
    } else {
      orderBy = [asc(products.sortOrder), desc(products.createdAt)];
    }

    return await db.query.products.findMany({
      where: searchFilter,
      with: { category: true },
      orderBy,
    });
  } catch (error) {
    console.warn("[ZAD][db] Failed to fetch products (database unavailable):", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getProductById(id: string) {
  try {
    return await db.query.products.findFirst({
      where: eq(products.id, id),
      with: { category: true },
    });
  } catch (error) {
    console.warn(`[ZAD][db] Failed to fetch product ${id}:`, error instanceof Error ? error.message : error);
    return null;
  }
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

  const [maxRes] = await db.select({ maxSort: max(products.sortOrder) }).from(products);
  const nextSortOrder = (maxRes?.maxSort ?? -1) + 1;

  await db.insert(products).values({
    name: data.name,
    price: data.price,
    compareAtPrice: data.compareAtPrice || null,
    description: data.description,
    details: JSON.stringify(data.details),
    images: JSON.stringify(data.images),
    sizes: JSON.stringify(data.sizes),
    colors: JSON.stringify(data.colors),
    categoryId: data.categoryId || null,
    stock: data.stock,
    tag: data.tag || null,
    active: data.active ?? true,
    sortOrder: nextSortOrder,
  });

  const created = await db.query.products.findFirst({
    where: eq(products.name, data.name),
    orderBy: [desc(products.createdAt)],
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  return created;
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

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.compareAtPrice !== undefined) updateData.compareAtPrice = data.compareAtPrice;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.details !== undefined) updateData.details = JSON.stringify(data.details);
  if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
  if (data.sizes !== undefined) updateData.sizes = JSON.stringify(data.sizes);
  if (data.colors !== undefined) updateData.colors = JSON.stringify(data.colors);
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (data.tag !== undefined) updateData.tag = data.tag || null;
  if (data.active !== undefined) updateData.active = data.active;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

  await db.update(products).set(updateData).where(eq(products.id, id));

  const updated = await db.query.products.findFirst({
    where: eq(products.id, id),
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/shop/${id}`);
  revalidatePath("/admin/products");
  return updated;
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
  });

  await db.delete(products).where(eq(products.id, id));

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/shop/${id}`);
  revalidatePath("/admin/products");
  return product;
}

export async function updateProductPrices(
  id: string,
  price: number,
  compareAtPrice: number | null
) {
  await requireAdmin();
  await db
    .update(products)
    .set({ price, compareAtPrice, updatedAt: new Date() })
    .where(eq(products.id, id));

  const updated = await db.query.products.findFirst({
    where: eq(products.id, id),
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/shop/${id}`);
  revalidatePath("/admin/products");
  return updated;
}

export async function moveProductOrder(id: string, direction: "up" | "down") {
  await requireAdmin();

  const allProducts = await db.query.products.findMany({
    columns: { id: true },
    orderBy: [asc(products.sortOrder), desc(products.createdAt)],
  });

  const currentIndex = allProducts.findIndex((product) => product.id === id);
  if (currentIndex === -1) {
    throw new Error("Product not found");
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= allProducts.length) {
    return null;
  }

  const reordered = [...allProducts];
  const [movedProduct] = reordered.splice(currentIndex, 1);
  reordered.splice(targetIndex, 0, movedProduct);

  await db.transaction(async (tx) => {
    for (let index = 0; index < reordered.length; index++) {
      await tx
        .update(products)
        .set({ sortOrder: index })
        .where(eq(products.id, reordered[index].id));
    }
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  return true;
}
