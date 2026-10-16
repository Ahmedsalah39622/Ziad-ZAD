import { db, pool } from "./src/lib/db";

async function main() {
  try {
    const products = await db.query.products.findMany({
      limit: 5,
    });
    console.log("Fetched products successfully:", JSON.stringify(products, null, 2));
  } catch (err) {
    console.error("Error fetching products:", err);
  } finally {
    await pool.end();
  }
}

main();
