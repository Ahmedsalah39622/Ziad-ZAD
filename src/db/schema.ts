import {
  mysqlTable,
  varchar,
  text,
  longtext,
  double,
  int,
  boolean,
  datetime,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";

export function generateId(): string {
  return (
    "c" +
    Math.random().toString(36).substring(2, 10) +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 6)
  );
}

// ─── User ────────────────────────────────────────────────────────────
export const users = mysqlTable("User", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(generateId),
  email: varchar("email", { length: 191 }).notNull().unique(),
  password: text("password").notNull(),
  name: varchar("name", { length: 191 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("CLIENT"),
  createdAt: datetime("createdAt", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

// ─── Category ────────────────────────────────────────────────────────
export const categories = mysqlTable("Category", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(generateId),
  name: varchar("name", { length: 191 }).notNull().unique(),
  slug: varchar("slug", { length: 191 }).notNull().unique(),
  createdAt: datetime("createdAt", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// ─── Product ─────────────────────────────────────────────────────────
export const products = mysqlTable("Product", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(generateId),
  name: varchar("name", { length: 255 }).notNull(),
  price: double("price").notNull(),
  compareAtPrice: double("compareAtPrice"),
  description: text("description").notNull(),
  details: text("details").notNull().default("[]"),
  images: longtext("images").notNull().default("[]"),
  sizes: text("sizes").notNull().default("[]"),
  colors: text("colors").notNull().default("[]"),
  categoryId: varchar("categoryId", { length: 191 }),
  stock: int("stock").notNull().default(0),
  active: boolean("active").notNull().default(true),
  tag: varchar("tag", { length: 100 }),
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: datetime("createdAt", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

// ─── Order ───────────────────────────────────────────────────────────
export const orders = mysqlTable("Order", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(generateId),
  userId: varchar("userId", { length: 191 }),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 100 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).notNull().default("PENDING"),
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull().default("COD"),
  paymentStatus: varchar("paymentStatus", { length: 50 }).notNull().default("UNPAID"),
  total: double("total").notNull(),
  discountCode: varchar("discountCode", { length: 100 }),
  discountPct: double("discountPct").notNull().default(0),
  shippingFee: double("shippingFee").notNull().default(0),
  createdAt: datetime("createdAt", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

// ─── OrderItem ───────────────────────────────────────────────────────
export const orderItems = mysqlTable("OrderItem", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(generateId),
  orderId: varchar("orderId", { length: 191 }).notNull(),
  productId: varchar("productId", { length: 191 }).notNull(),
  quantity: int("quantity").notNull(),
  price: double("price").notNull(),
  size: varchar("size", { length: 50 }),
  color: varchar("color", { length: 50 }),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// ─── DiscountCode ────────────────────────────────────────────────────
export const discountCodes = mysqlTable("DiscountCode", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(generateId),
  code: varchar("code", { length: 100 }).notNull().unique(),
  discountPct: double("discountPct").notNull(),
  usesPerCode: int("usesPerCode").notNull().default(1),
  usedCount: int("usedCount").notNull().default(0),
  expiresAt: datetime("expiresAt", { mode: "date" }),
  createdAt: datetime("createdAt", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// ─── SiteSetting ─────────────────────────────────────────────────────
export const siteSettings = mysqlTable("SiteSetting", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(generateId),
  key: varchar("key", { length: 191 }).notNull().unique(),
  value: longtext("value").notNull(),
  createdAt: datetime("createdAt", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

// ─── TypeScript Types Matching Legacy Prisma Models ──────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type DiscountCode = typeof discountCodes.$inferSelect;
export type NewDiscountCode = typeof discountCodes.$inferInsert;

export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;
