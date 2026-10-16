"use server";

import { db, categories, products } from "@/lib/db";
import { eq, count } from "drizzle-orm";

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
  const allCategories = await db.query.categories.findMany({
    orderBy: (tbl, { asc }) => [asc(tbl.name)],
    with: {
      products: {
        columns: { id: true },
      },
    },
  });

  return allCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    _count: { products: c.products.length },
  }));
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
