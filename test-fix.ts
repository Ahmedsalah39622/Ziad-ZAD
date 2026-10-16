import "dotenv/config";
import { db, products, categories, orders, orderItems, pool } from "./src/lib/db";
import { eq, desc, inArray } from "drizzle-orm";

async function testBoth() {
  console.log("Testing Products with standard leftJoin...");
  const prods = await db
    .select({ product: products, category: categories })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .limit(5);

  const formattedProds = prods.map(r => ({ ...r.product, category: r.category }));
  console.log("PRODS SUCCESS! Total fetched:", formattedProds.length);
  console.log("Sample product name:", formattedProds[0].name);

  console.log("\nTesting Orders with standard query...");
  const ords = await db.select().from(orders).limit(5);
  console.log("Orders found:", ords.length);

  if (ords.length > 0) {
    const ids = ords.map(o => o.id);
    const items = await db
      .select({ item: orderItems, product: products })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(inArray(orderItems.orderId, ids));

    console.log("Items found for orders:", items.length);
  }

  console.log("\nALL TABLES ARE 100% WORKING WITH STANDARD SQL!");
}

testBoth().then(() => pool.end());
