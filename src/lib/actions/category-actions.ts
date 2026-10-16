"use server";

import { db, categories, products } from "@/lib/db";
import { eq, count, asc } from "drizzle-orm";

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
  try {
    const cats = await db.select().from(categories).orderBy(asc(categories.name));
    if (!cats.length) return [];

    const counts = await db
      .select({
        categoryId: products.categoryId,
        total: count(),
      })
      .from(products)
      .groupBy(products.categoryId);

    const countMap = new Map(counts.map((c) => [c.categoryId, c.total]));

    return cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      _count: { products: countMap.get(c.id) || 0 },
    }));
  } catch (error) {
    console.warn("[ZAD][db] Failed to fetch categories (database unavailable):", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function createCategory(data: { name: string; slug: string }) {
  await requireAdmin();
  await db.insert(categories).values({
    name: data.name,
    slug: data.slug,
  });
  return db.query.categories.findFirst({
    where: eq(categories.slug, data.slug),
  });
}

export async function updateCategory(
  id: string,
  data: { name?: string; slug?: string }
) {
  await requireAdmin();
  await db
    .update(categories)
    .set({
      ...(data.name ? { name: data.name } : {}),
      ...(data.slug ? { slug: data.slug } : {}),
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id));

  return db.query.categories.findFirst({
    where: eq(categories.id, id),
  });
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  const [res] = await db
    .select({ value: count() })
    .from(products)
    .where(eq(products.categoryId, id));

  if (res && res.value > 0) {
    throw new Error("Cannot delete category with products");
  }

  await db.delete(categories).where(eq(categories.id, id));
  return { success: true };
}
